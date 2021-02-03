import {createAction, handleActions} from 'redux-actions';
 
const {getCombinedConfig} = require('../lib/getConfig');
const config = getCombinedConfig({storeName:'optionStore', electronPath:'home'});

const {
    NUMBER_OF_CHANNELS,
    KAFKA_TOPIC=`topic_${Date.now()}`, 
    KAFKA_KEY='none'
} = config;

import {remote} from 'electron';
const Store = require('electron-store');
const statisticsStore = new Store({
    name:'statisticsStore',
    cwd:remote.app.getPath('home')
})

const clipStore = new Store({
    name:'clipStore',
    cwd:remote.app.getPath('home')
})

const getChannelClipCountInStore = channelNumber => {
    const allClips = clipStore.store;
    const count = Object.entries(allClips).filter(([id, clipInfo]) => {
        return clipInfo.channelNumber === channelNumber
    }).length
    return count;
}

const fs = require('fs');
const path = require('path');
const getChannelClipCountInDirectory = (state, channelNumber) => {
    return new Promise((resolve, reject) => {
        try {
            const channelRecorder = state.hlsRecorders.recorders.get(channelNumber);
            const saveFolder = channelRecorder.channelDirectory;
            const {localm3u8} = channelRecorder;
            fs.readdir(saveFolder, (err, files) => {
                // console.log(`@@@ channelNumber=${channelNumber} localm3u8=${localm3u8} allFolderCount=${files.length}`)
                const countInFolder = localm3u8 === null ? files.length : files.filter(file => {
                    const currentFolder = path.join(saveFolder, file);
                    const currentRecordingFolder = path.dirname(localm3u8);
                    currentFolder === currentRecordingFolder && console.log(`@@@ currentFolder=${currentFolder} currentRecordingFolder=${currentRecordingFolder} ${currentFolder !== currentRecordingFolder}`)
                    return currentFolder !== currentRecordingFolder
                }).length;
                // console.log(`@@@ countInFolder=${countInFolder}`);
                resolve(countInFolder);
            })
        } catch (err) {
            console.error(err);            
        }

    })
}

// const getTotalClipInStore = () => { return clipStore.size };
const getTotalClipInStore = () => {
    let totalCount = 0;
    for(let channelNumber=1; channelNumber <= NUMBER_OF_CHANNELS; channelNumber++){
        const channelClipCountInStore = getChannelClipCountInStore(channelNumber);
        totalCount += channelClipCountInStore;
    }
    return totalCount;
}

const getTotalClipInFolder = async state => {
    return new Promise((resolve, reject) => {
        const {recorders} = state.hlsRecorders
        const getCountInSubDir = [...recorders].map(async ([channelNumber, recorder]) => {
            return await getChannelClipCountInDirectory(state, channelNumber);
        })
        Promise.all(getCountInSubDir)
        .then(clipCounts => {
            const totalCounts = clipCounts.reduce((total, count) => {
                return total + count;                
            }, 0)
            resolve(totalCounts);
        })
    })

}

// define initial stats
const INITIAL_APP_STATS = {
    startTime: Date.now(),
    reloadTimeManual: null,
    reloadCountManual: 0,
    reloadTimeAutomatic: null,
    reloadCountAutomatic: 0,
    memClearTime: null,
    memClearCount: 0,
    refreshCount: 0,
    successCount: 0,
    failureCount: 0,
    abortCount: 0,
    totalClipsInStore: 'calculating...',
    totalClipsInFolder: 'calculating...'
}

const INITIAL_CHANNEL_STAT = {
    refreshCount: 0,
    successCount: 0,
    failureCount: 0,
    abortCount:0,
    lastRefreshTime: null,
    lastSuccessTime: null,
    lastFailureTime: null,
    lastAbortTime: null,
    clipCountStore: 0,
    clipCountFolder: 0
}

// action types
const SET_APP_STAT = 'statistics/SET_APP_STAT';
const SET_CHANNEL_STAT = 'statistics/SET_CHANNEL_STAT';
const REPLACE_APP_STAT = 'statistics/CLEAR_APP_STAT';
const REPLACE_CHANNEL_STAT = 'statistics/CLEAR_CHANNEL_STAT';
const INCREASE_APP_STAT = 'statistics/INCREASE_APP_STAT';
const INCREASE_CHANNEL_STAT = 'statistics/INCREASE_CHANNEL_STAT';

// action creator
export const setAppStat = createAction(SET_APP_STAT);
export const setChannelStat= createAction(SET_CHANNEL_STAT);
export const replaceAppStat = createAction(REPLACE_APP_STAT);
export const replaceChannelStat= createAction(REPLACE_CHANNEL_STAT);
export const increaseAppStat= createAction(INCREASE_APP_STAT);
export const increaseChannelStat= createAction(INCREASE_CHANNEL_STAT);

import {kafka} from '../lib/kafkaSender';
import { sendMessage } from '../lib/kafkaClient';
const kafkaSender = kafka({topic:KAFKA_TOPIC});

const sendAppMessage = statusReport => {
    statusReport.type = 'appStatistics';
    statusReport.source = 'app';
    kafkaSender.send({
        key: KAFKA_KEY,
        messageJson: statusReport
    })
}
// redux thunk
export const setAppStatNStore = ({statName, value}) => (dispatch, getState) => {
    
    const statusReport = {
        name: statName,
        value
    }
    sendAppMessage(statusReport);
    statisticsStore.set(`appStats.${statName}`, value);
    dispatch(setAppStat({statName, value}));
}

export const increaseAppStatNStore = ({statName}) => (dispatch, getState) => {
    const state = getState();
    const value = state.statistics.appStat[statName] + 1;

    const statusReport = {
        name: statName,
        value
    }
    sendAppMessage(statusReport);
    statisticsStore.set(`appStats.${statName}`, value);
    dispatch(increaseAppStat({statName}))
}

const sendChannelMessage = statusReport => {
    statusReport.type = 'channelStatistics';
    statusReport.source = `channel${statusReport.channelNumber}`;
    kafkaSender.send({
        key: KAFKA_KEY,
        messageJson: statusReport
    })
}

export const setChannelStatNStore = ({channelNumber, statName, value}) => async (dispatch, getState) => {

    const state = getState();
    const hlsPlayer = {...state.hlsPlayers.players.get(channelNumber)};
    const {title} = hlsPlayer.source;
    const statusReport = {
        channelNumber,
        title: title,
        name: statName,
        value
    }
    sendChannelMessage(statusReport);    
    statisticsStore.set(`channelStats.${channelNumber}.${statName}`, value);
    dispatch(setChannelStat({channelNumber, statName, value}));

    // apply app stat (time and count info)
    dispatch(setAppStatNStore({statName, value}));

    // refresh clip count of store on both store and state 
    const countInStore = getChannelClipCountInStore(channelNumber);
    dispatch(setChannelStat({channelNumber, statName:'clipCountStore', value:countInStore}))
    statisticsStore.set(`channelStats.${channelNumber}.clipCountStore`, countInStore);

    // refresh clip count of directory on both store and state 
    const countInFolder = await getChannelClipCountInDirectory(state, channelNumber);
    dispatch(setChannelStat({channelNumber, statName:'clipCountFolder', value: countInFolder}));
    statisticsStore.set(`channelStats.${channelNumber}.clipCountFolder`, countInFolder);
}

export const increaseChannelStatsNStore = ({channelNumber, statName}) => async (dispatch, getState) => {
    const state = getState();
    const value = state.statistics.channelStats[channelNumber][statName] + 1;
    const hlsPlayer = {...state.hlsPlayers.players.get(channelNumber)};
    const {title} = hlsPlayer.source;
    const statusReport = {
        channelNumber,
        title: title,
        name: statName,
        value
    }
    sendChannelMessage(statusReport);    
    statisticsStore.set(`channelStats.${channelNumber}.${statName}`, value);
    dispatch(increaseChannelStat({channelNumber, statName}));
    
    dispatch(increaseAppStatNStore({statName}));
    dispatch(refreshClipCountStatistics());
}

// clear stat and statStore
export const clearAppStatNStore = () => (dispatch, getState) => {
    const [initialAppStats] = getInitialState();
    statisticsStore.set(`appStats`, initialAppStats);
    dispatch(replaceAppStat({initialAppStats}));
}

const refreshClipCountStatistics = () => async (dispatch, getState) => {
    const state = getState();
    const countInStore = getTotalClipInStore();
    const countInFolder = await getTotalClipInFolder(state)
    dispatch(setAppStatNStore({statName:'totalClipsInFolder', value:countInFolder}));
    dispatch(setAppStatNStore({statName:'totalClipsInStore', value:countInStore}));
}   

export const refreshChannelClipCountStatistics = ({channelNumber}) => async (dispatch, getState) => {
    const state = getState();
    const countInStore = getChannelClipCountInStore(channelNumber);
    const countInFolder = await getChannelClipCountInDirectory(state, channelNumber);
    dispatch(setChannelStat({channelNumber, statName:'clipCountStore', value:countInStore}))
    dispatch(setChannelStat({channelNumber, statName:'clipCountFolder', value: countInFolder}));
    dispatch(refreshClipCountStatistics());
}  



export const clearChannelStatNStore = ({channelNumber}) => (dispatch, getState) => {
    const [initialAppStats, initialChannelStats] = getInitialState();
    const initialChannelStat = initialChannelStats[channelNumber];``
    statisticsStore.set(`channelStats.${channelNumber}`, initialChannelStat);
    dispatch(replaceChannelStat({channelNumber, initialChannelStat}));
}

export const clearAllChannelStatNStore = () => (dispatch, getState) => {
    for(let channelNumber=1;channelNumber<=NUMBER_OF_CHANNELS;channelNumber++){
        dispatch(clearChannelStatNStore({channelNumber}));
    }
}



// set initial status
const getInitialState = statisticsStore => {
    if(statisticsStore === undefined || statisticsStore.size === 0){
        const initialAppStats = INITIAL_APP_STATS;
        const initialChannelStats = {};
        for(let channelNumber=1;channelNumber<=NUMBER_OF_CHANNELS;channelNumber++){
            initialChannelStats[channelNumber] = INITIAL_CHANNEL_STAT;
        }
        return [initialAppStats, initialChannelStats];
    }
    return [statisticsStore.get('appStats'), statisticsStore.get('channelStats')];
}

const setStaticsStore = (store, appStats, channelStats) => {
    store.set('appStats', appStats);
    store.set('channelStats', channelStats);
}

const [initialAppStats, initialChannelStats] = getInitialState(statisticsStore);
statisticsStore.size === 0 && setStaticsStore(statisticsStore, initialAppStats, initialChannelStats)

const initialState = {
    appStat: initialAppStats,
    channelStats: initialChannelStats
}

// reducer
export default handleActions({
    [SET_APP_STAT]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {statName, value} = action.payload;
        const appStat = {...state.appStat};
        appStat[statName] = value;
        return {
            ...state,
            appStat
        }
    },
    [SET_CHANNEL_STAT]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {channelNumber, statName, value} = action.payload;
        const channelStats = {...state.channelStats};
        const channelStat = channelStats[channelNumber];
        channelStat[statName] = value;
        channelStats[channelNumber] = {...channelStat};
        return {
            ...state,
            channelStats
        }
    },
    [REPLACE_APP_STAT]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {initialAppStats} = action.payload;
        return {
            ...state,
            appStat: {...initialAppStats}
        }
    },
    [REPLACE_CHANNEL_STAT]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {channelNumber, initialChannelStat} = action.payload;
        const channelStats = {...state.channelStats};
        const channelStat = channelStats[channelNumber];
        channelStats[channelNumber] = {...initialChannelStat};
        return {
            ...state,
            channelStats
        }
    },
    [INCREASE_APP_STAT]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {statName} = action.payload;
        const appStat = {...state.appStat};
        appStat[statName] = appStat[statName] + 1;
        return {
            ...state,
            appStat
        }
    },
    [INCREASE_CHANNEL_STAT]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {channelNumber, statName} = action.payload;
        const channelStats = {...state.channelStats};
        const channelStat = channelStats[channelNumber];
        channelStat[statName] = channelStat[statName] + 1;
        channelStats[channelNumber] = {...channelStat};
        return {
            ...state,
            channelStats
        }
    }
}, initialState);