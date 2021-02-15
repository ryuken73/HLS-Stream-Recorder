import {createAction, handleActions} from 'redux-actions';
import {setPlayerSource, refreshPlayer} from './hlsPlayers';
import {setChannelStatNStore, increaseChannelStatsNStore} from './statistics';
import {cctvFromConfig} from '../lib/getCCTVList';
import {getCombinedConfig,getDefaultConfig}  from '../lib/getConfig';

const sources = cctvFromConfig();
const config = getCombinedConfig({storeName:'optionStore', electronPath:'home'});

const {
    NUMBER_OF_CHANNELS,
    CHANNEL_PREFIX,
    BASE_DIRECTORY,
    DEFAULT_SCHEDULE_PROPS,
    WAIT_SECONDS_MS_FOR_PLAYBACK_CHANGE,
    SLEEP_MS_BETWEEN_ALL_START=2000,
    SLEEP_MS_BETWEEN_ALL_STOP=300,
    RESTART_SCHEDULE_SLEPP_MS=5000
} = config;

const {
    defaultInterval,
    intervalsForSelection
} = DEFAULT_SCHEDULE_PROPS

const INITIAL_DURATION = '00:00:00.00';
const INITIAL_INTERVAL = defaultInterval;

import {date, file} from '../utils';
async function mkdir(directory){
    try {
        await file.makeDirectory(directory);
    } catch (err) {
        console.error('in hlsRecorder module');
        console.error(err);
    }
}

const recorders = new Map();

const {remote} = require('electron');
const Store = require('electron-store');
const intervalStore = new Store({
    name:'intervalStore',
    cwd:remote.app.getPath('home')
})

const sourceStore = new Store({
    name:'sourceStore',
    cwd:remote.app.getPath('home')
})

const fs = require('fs');

// initialize recorder
const path = require('path');
for(let channelNumber=1 ; channelNumber<=NUMBER_OF_CHANNELS ; channelNumber++){
    const arrayIndex = channelNumber - 1;
    // const source = sources[arrayIndex] || {};
    const source = sourceStore.get(channelNumber.toString()) || sources[channelNumber-1]
    const {title="없음", url=""} = source;
    const channelName = `${CHANNEL_PREFIX}${channelNumber}`;
    const channelDirectory = path.join(BASE_DIRECTORY, channelName);
    const hlsRecorder = {
        channelName,
        channelDirectory,
        playerHttpURL: url,
        duration: INITIAL_DURATION,
        recorder: null,
        inTransition: false,
        scheduleFunction: null,
        localm3u8: null,
        mountRecorder: true,
        recorderStatus: 'stopped',
        scheduleStatus: 'stopped',
        scheduleInterval: intervalStore.get(channelNumber.toString()) || INITIAL_INTERVAL,        
    }
    recorders.set(channelNumber, hlsRecorder);
}
// initialize config statue
const initialConfig = {
    intervalsForSelection
}

// action types
const SET_DURATION = 'hlsRecorders/SET_DURATION';
const SET_RECORDER = 'hlsRecorders/SET_RECORDER';
const SET_RECORDER_STATUS = 'hlsRecorders/SET_RECORDER_STATUS';
const SET_RECORDER_INTRANSITION = 'hlsRecorders/SET_RECORDER_INTRANSITION';
const SET_RECORDER_LOCALM3U8 = 'hlsRecorders/SET_RECORDER_LOCALM3U8';
const SET_RECORDER_MOUNT = 'hlsRecorders/SET_RECORDER_MOUNT';
const SET_SCHEDULE_FUNCTION = 'hlsRecorders/SET_SCHEDULE_FUNCTION';
const SET_SCHEDULE_INTERVAL = 'hlsRecorders/SET_SCHEDULE_INTERVAL';
const SET_SCHEDULE_STATUS = 'hlsRecorders/SET_SCHEDULE_STATUS';
const SET_AUTO_START_SCHEDULE = 'hlsRecorders/SET_AUTO_START_SCHEDULE';
const SAVE_PLAYER_HTTP_URL = 'hlsRecorders/SAVE_PLAYER_HTTP_URL';

// action creator
export const setDuration = createAction(SET_DURATION);
export const setRecorder = createAction(SET_RECORDER);
export const setRecorderStatus = createAction(SET_RECORDER_STATUS);
export const setRecorderInTransition = createAction(SET_RECORDER_INTRANSITION);
export const setRecorderLocalm3u8 = createAction(SET_RECORDER_LOCALM3U8);
export const setRecorderMount = createAction(SET_RECORDER_MOUNT);
export const setScheduleFunction = createAction(SET_SCHEDULE_FUNCTION);
export const setScheduleInterval = createAction(SET_SCHEDULE_INTERVAL);
export const setScheduleStatus = createAction(SET_SCHEDULE_STATUS);
export const setAutoStartSchedule = createAction(SET_AUTO_START_SCHEDULE);
export const savePlayerHttpURL = createAction(SAVE_PLAYER_HTTP_URL);

import log from 'electron-log';
const createLogger = channelName => {
    return {
        info: msg => {log.info(`[${channelName}][ChannelControl]${msg}`)},
        error: msg => {log.error(`[${channelName}][ChannelControl]${msg}`)}
    }
}

import HLSRecorder from '../lib/RecordHLS_ffmpeg';
import {getAbsolutePath} from '../lib/electronUtil';
import SelectInput from '@material-ui/core/Select/SelectInput';

const getChanneler = (state, channelNumber) => {
    const {recorders} = state.hlsRecorders;
    const {players} = state.hlsPlayers;
    const hlsRecorder = recorders.get(channelNumber);
    const hlsPlayer = players.get(channelNumber);
    const channelLog = createLogger(hlsRecorder.channelName)
    return [hlsRecorder, hlsPlayer, channelLog]
}

export const createRecorder = (channelNumber, createdByError=false) => (dispatch, getState) => {
    const state = getState();
    const [hlsRecorder, hlsPlayer, channelLog] = getChanneler(state, channelNumber);
    const {
        channelName,
        channelDirectory,
        scheduleStatus
    } = hlsRecorder;

    const {source={}} = hlsPlayer;
    const {url=''} = source;

    channelLog.info(`create HLS Recorder`)

    const ffmpegPath = getAbsolutePath('bin/ffmpeg.exe', true);
    if(!fs.existsSync(ffmpegPath)){
        const notification = new window.Notification('Error', {
            body: 'No ffmpeg.exe in bin folder. copy file and retry'
        })
    }
    const recorderOptions = {
        name: channelName,
        src: url, 
        channelDirectory,
        enablePlayback: true, 
        localm3u8:'',
        ffmpegBinary: ffmpegPath,
        renameDoneFile: false,
    }
    const recorder = HLSRecorder.createHLSRecoder(recorderOptions);

    const progressHandler = progress => {
        dispatch(setDuration({channelNumber, duration:progress.duration}));
    }
    const errorHandler = (localm3u8, startTimestamp, duration, error) => {
        channelLog.error(`error occurred`);
        channelLog.info(`recorder emitted error: m3u8:${localm3u8} error:${error} duration:${duration}`)
        // if directory empty, remove directory or emit end to save record on clipStore
        fs.lstat(localm3u8, (error, stats) => {
          if(error){
              // file not exists, delete directory
              channelLog.error(`aborted: directory not exists error: ${error}`);

              fs.rmdir(path.dirname(localm3u8), err => channelLog.error(`aborted: rmdir failed. error : ${err}`));
              // resetPlayer => change mode from playback to source streaming
              dispatch(refreshPlayer({channelNumber}));
              // resetRecorder => initialize recorder status(duration, status..)
              dispatch(refreshRecorder({channelNumber}));
              dispatch(setChannelStatNStore({channelNumber, statName:'lastAbortTime', value:Date.now()}))
              dispatch(increaseChannelStatsNStore({channelNumber, statName:'abortCount'}))
          } else {
              // file is valid. emit normal end event to save clip on clipStore
              dispatch(setChannelStatNStore({channelNumber, statName:'lastFailureTime', value:Date.now()}))
              dispatch(increaseChannelStatsNStore({channelNumber, statName:'failureCount'}))
              recorder.emit('end', localm3u8, startTimestamp, duration);
          }
        })

        // finally recreateRecorder with createdByError=true
        // this will recreate recorder and restart scheule
        // need some sleep time
        setTimeout(() => {
            dispatch(createRecorder(channelNumber, /*createdByError */ true));
        }, RESTART_SCHEDULE_SLEPP_MS);
    }
    
    // recorder.on('start', startHandler)
    recorder.on('progress', progressHandler)
    recorder.on('error', errorHandler)
    dispatch(setRecorder({channelNumber, recorder}))
    createdByError && scheduleStatus === 'started' && dispatch(startRecording(channelNumber));
}


const getOutputName = (hlsRecorder, hlsPlayer) => {
    const {channelName, channelDirectory} = hlsRecorder;
    const {source} = hlsPlayer;
    const now = date.getString(new Date(),{sep:'-'});
    const jobDescString = `${channelName}_${now}_${Date.now()}_${source.title}`;
    const safeForWinFile = file.toSafeFileNameWin(jobDescString);
    const saveDirectory = path.join(channelDirectory, safeForWinFile);
    const subDirectory = safeForWinFile;
    const localm3u8 = path.join(saveDirectory, `${channelName}_stream.m3u8`);
    return [saveDirectory, localm3u8, subDirectory];
}

export const setScheduleIntervalNSave = ({channelNumber, scheduleInterval}) => (dispatch, getState) => {
    const state = getState();
    const {intervalStore} = state.app;
    intervalStore.set(channelNumber, scheduleInterval);
    dispatch(setScheduleInterval({channelNumber, scheduleInterval}))
}

export const refreshRecorder = ({channelNumber}) => (dispatch, getState) => {
    const state = getState();
    const {recorders} = state.hlsRecorders;
    const hlsRecorder = recorders.get(channelNumber);
    dispatch(setRecorderStatus({channelNumber, recorderStatus: 'stopped'}))
    dispatch(setRecorderInTransition({channelNumber, inTransition:false}));
    dispatch(setDuration({channelNumber, duration:INITIAL_DURATION}));
    dispatch(setPlayerSource({channelNumber, url:hlsRecorder.playerHttpURL}))
}

export const remountRecorder = ({channelNumber}) => (dispatch, getState) => {
    dispatch(setRecorderMount({channelNumber, mountRecorder:false}));
    setTimeout(() => {
        dispatch(setRecorderMount({channelNumber, mountRecorder:true}));
    },500)
}

export const remountRecorderAll = () => (dispatch, getState) => {
    console.log('#### remountRecorderAll called')
    const state = getState();
    const {recorders} = state.hlsRecorders;
    const recordersArray = [...recorders];
    console.log('#### remountRecorderAll called', recordersArray)

    for(let index=0; index < recordersArray.length ; index++){
        const channelNumber = recordersArray[index][0];
        console.log('#####', channelNumber)
        setTimeout(() => {
            dispatch(remountRecorder({channelNumber}));
        }, index * 100)
    }    
}

export const restartRecording = channelNumber => (dispatch, getState) => {
    const state = getState();
    const [hlsRecorder] = getChanneler(state, channelNumber);
    const {scheduleStatus} = hlsRecorder;
    scheduleStatus === 'started' && dispatch(startRecording(channelNumber));
}

const rimraf = require('rimraf');
export const startRecording = (channelNumber) => (dispatch, getState) => {
    return new Promise((resolve, reject) => {
        console.log(`#### in startRecording:`, channelNumber);
        const state = getState();
        const [hlsRecorder, hlsPlayer, channelLog] = getChanneler(state, channelNumber);
        const {
            channelName,
            recorder,
        } = hlsRecorder;
        const {source} = hlsPlayer;
        const {clipStore} = state.app;
    
        channelLog.info(`start startRecroding() recorder.createTime:${recorder.createTime}`)
    
        const [saveDirectory, localm3u8, subDirectory] = getOutputName(hlsRecorder, hlsPlayer);
        
        recorder.src = hlsRecorder.playerHttpURL;
        recorder.target = localm3u8;
        recorder.localm3u8 = localm3u8;
        hlsRecorder.localm3u8 = localm3u8;
        
        mkdir(saveDirectory);
        dispatch(setRecorderInTransition({channelNumber, inTransition:true}))
        dispatch(setRecorderStatus({channelNumber, recorderStatus: 'starting'}))
    
        recorder.once('start', (cmd) => {
            channelLog.info(`recorder emitted start (start handler to change playback source) : ${cmd}`)
            setTimeout(() => {
                dispatch(setRecorderStatus({channelNumber, recorderStatus: 'started'}));
                dispatch(setRecorderInTransition({channelNumber, inTransition:false}));
                dispatch(setPlayerSource({channelNumber, url:localm3u8}))
                resolve(true);
            },WAIT_SECONDS_MS_FOR_PLAYBACK_CHANGE);
        })
        recorder.once('end', async (clipName, startTimestamp, duration) => {
            try {
                console.log('####### recorder.once end', hlsRecorder.localm3u8);
                const endTimestamp = Date.now();
                const startTime = date.getString(new Date(startTimestamp),{sep:'-'})
                const endTime = date.getString(new Date(endTimestamp),{sep:'-'})
                const url = hlsRecorder.playerHttpURL;
                const title = source.title;
                const hlsDirectory = saveDirectory;
                const clipId = subDirectory;
                const hlsm3u8 = localm3u8;
                const clipData = {
                    clipId,
                    channelNumber,
                    channelName,
                    startTime,
                    endTime,
                    startTimestamp,
                    endTimestamp,
                    url,
                    title,
                    hlsDirectory,
                    duration,
                    hlsm3u8,
                    saveDirectory,
                    mp4Converted:false
                }
                console.log('#######', clipData);
                dispatch(setRecorderLocalm3u8({channelNumber, localm3u8:null}));
                if(duration === INITIAL_DURATION){
                    channelLog.error(`aborted: useless clip(duration === 00:00:00.00). discard and delete ${saveDirectory}`);
                    saveDirectory.startsWith(BASE_DIRECTORY) && rimraf(saveDirectory);
                    dispatch(setChannelStatNStore({channelNumber, statName:'lastAbortTime', value:Date.now()}))
                    dispatch(increaseChannelStatsNStore({channelNumber, statName:'abortCount'}))
                    dispatch(refreshRecorder({channelNumber}));
                    return
                }
                clipStore.set(clipId, clipData);
                dispatch(setChannelStatNStore({channelNumber, statName:'lastSuccessTime', value:Date.now()}))
                dispatch(increaseChannelStatsNStore({channelNumber, statName:'successCount'}))
                dispatch(refreshRecorder({channelNumber}));
            } catch (error) {
                if(error){
                    channelLog.error(error)
                }
            }
        })
    
        recorder.start();
    })
}

export const stopRecording = (channelNumber) => (dispatch, getState) => {    
    return new Promise((resolve, reject) => {
        try {
            const state = getState();
            const [hlsRecorder, hlsPlayer, channelLog] = getChanneler(state, channelNumber);

            const {
                recorder,
                inTransition,
                recorderStatus
            } = hlsRecorder;

            channelLog.info(`start stopRecording(): recorderStatus: ${recorderStatus}, recorder.createTime:${recorder.createTime}`)
            if(recorderStatus !== 'started'){
                resolve(true);
                return;
            }
            dispatch(setRecorderStatus({channelNumber, recorderStatus: 'stopping'}))
            dispatch(setRecorderInTransition({channelNumber, inTransition:true}));
            recorder.once('end', async clipName => {
                channelLog.info(`recorder normal stopRecording. emitted end (listener2)`)
                resolve(true);
            })
            recorder.stop();
        } catch (err) {
            channelLog.error(`error in stopRecording`);
            log.error(err);
            dispatch(refreshRecorder({channelNumber}));
            resolve(true)
        }
    })
}

export const stopRecordingForce = channelNumber => (dispatch, getState) => {
    try {
        const state = getState();
        const [hlsRecorder, hlsPlayer, channelLog] = getChanneler(state, channelNumber);
        const {recorder} = hlsRecorder;
        channelLog.error(`stop recoder force!!`);
        recorder.destroy()
    } catch (err) {
        channelLog.error(`error in stop recorder force. ${err}`)
    }
}

export const startRecordAll = () => async (dispatch, getState) => {
    const state = getState();
    const {recorders} = state.hlsRecorders;
    const channelNumbers = [...recorders.keys()]
    // channelNumbers.forEach(async channelNumber => { // forEach loop execute concurrently
    for(let index=0; index < channelNumbers.length; index++){
        dispatch(startRecording(channelNumbers[index]))
        await sleepms(SLEEP_MS_BETWEEN_ALL_START);
    }
}

export const stopRecordAll = () => async (dispatch, getState) => {
    const state = getState();
    const {recorders} = state.hlsRecorders;
    const channelNumbers = [...recorders.keys()].filter(channelNumber => {
        const recorder = recorders.get(channelNumber);
        return recorder.recorderStatus === 'started';
    })
    for(let index=0; index < channelNumbers.length; index++){
        dispatch(stopRecording(channelNumbers[index]))
        await sleepms(SLEEP_MS_BETWEEN_ALL_STOP);
    }
}

export const startSchedule = channelNumber => async (dispatch, getState) => {
    dispatch(setScheduleStatus({channelNumber, scheduleStatus:'starting'}));
    const state = getState();
    const [hlsRecorder, hlsPlayer, channelLog] = getChanneler(state, channelNumber);

    const {recorder, scheduleInterval} = hlsRecorder;
    channelLog.info(`### start schedule : recorder.createTime=${recorder.createTime}`)

    dispatch(stopRecording(channelNumber))
    .then((result) => {
        dispatch(startRecording(channelNumber))
    })
    .then((result) => {
        dispatch(setScheduleStatus({channelNumber, scheduleStatus:'started'}));
    })
    const scheduleFunction = setInterval( async () => {
        dispatch(stopRecording(channelNumber))
        .then(result => {
            return dispatch(startRecording(channelNumber))
        })
    }, scheduleInterval);
    dispatch(setScheduleFunction({channelNumber, scheduleFunction}))
}

export const stopSchedule = channelNumber => async (dispatch, getState) => {
    const state = getState();
    const [hlsRecorder, hlsPlayer, channelLog] = getChanneler(state, channelNumber);

    const {recorder, scheduleFunction} = hlsRecorder;
    channelLog.info(`### stop schedule : recorder.createTime=${recorder.createTime}`)

    dispatch(setScheduleStatus({channelNumber, scheduleStatus:'stopping'}))
    clearInterval(scheduleFunction);
    dispatch(setScheduleFunction({channelNumber, scheduleFunction:null}));
    // if(recorder.isBusy) {
    //     dispatch(await stopRecording(channelNumber))
    //     .then(result => {
    //         dispatch(setScheduleStatus({channelNumber, scheduleStatus:'stopped'}));
    //     })
    // } else {
    //     dispatch(setScheduleStatus({channelNumber, scheduleStatus:'stopped'}));
    // }
    dispatch(await stopRecording(channelNumber))
    .then(result => {
        dispatch(setScheduleStatus({channelNumber, scheduleStatus:'stopped'}));
    })

}

const sleepms = timems => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(true);   
        }, timems);
    })
}

export const startScheduleAll = () => async (dispatch, getState) => {
    const state = getState();
    const {recorders} = state.hlsRecorders;
    const channelNumbers = [...recorders.keys()]
    // channelNumbers.forEach(async channelNumber => { // forEach loop execute concurrently
    for(let index=0; index < channelNumbers.length; index++){
        dispatch(startSchedule(channelNumbers[index]))
        await sleepms(SLEEP_MS_BETWEEN_ALL_START);
    }
    // })
}

export const stopScheduleAll = () => async (dispatch, getState) => {
    const state = getState();
    const {recorders} = state.hlsRecorders;
    const channelNumbers = [...recorders.keys()].filter(channelNumber => {
        const recorder = recorders.get(channelNumber);
        return recorder.scheduleStatus === 'started';
    })
    for(let index=0; index < channelNumbers.length; index++){
        dispatch(stopSchedule(channelNumbers[index]))
        await sleepms(SLEEP_MS_BETWEEN_ALL_STOP);
    }
}

export const changeAllIntervals = interval =>  (dispatch, getState) => {
    const state = getState();
    const {recorders} = state.hlsRecorders;
    const channelNumbers = [...recorders.keys()];
    channelNumbers.forEach(channelNumber => {
        dispatch(setScheduleIntervalNSave({channelNumber, scheduleInterval:interval}))
    })
}

const initialState = {
    recorders,
    config: initialConfig
}

// reducer
export default handleActions({
    [SET_DURATION]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {channelNumber, duration} = action.payload;
        const recorder = {...state.recorders.get(channelNumber)};
        recorder.duration = duration;
        const recorders = new Map(state.recorders);
        recorders.set(channelNumber, recorder);
        return {
            ...state,
            recorders
        }
    },
    [SET_RECORDER]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {channelNumber, recorder} = action.payload;
        const channelRecorder = {...state.recorders.get(channelNumber)};
        channelRecorder.recorder = recorder;
        const recorders = new Map(state.recorders);
        recorders.set(channelNumber, channelRecorder);
        return {
            ...state,
            recorders
        }
    },
    [SET_RECORDER_STATUS]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {channelNumber, recorderStatus} = action.payload;
        const channelRecorder = {...state.recorders.get(channelNumber)};
        channelRecorder.recorderStatus = recorderStatus;
        const recorders = new Map(state.recorders);
        recorders.set(channelNumber, channelRecorder);
        return {
            ...state,
            recorders
        }
    },
    [SET_RECORDER_INTRANSITION]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {channelNumber, inTransition} = action.payload;
        const channelRecorder = {...state.recorders.get(channelNumber)};
        channelRecorder.inTransition = inTransition;
        const recorders = new Map(state.recorders);
        recorders.set(channelNumber, channelRecorder);
        return {
            ...state,
            recorders
        }
    },
    [SET_RECORDER_LOCALM3U8]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {channelNumber, localm3u8} = action.payload;
        const channelRecorder = {...state.recorders.get(channelNumber)};
        channelRecorder.localm3u8 = localm3u8;
        const recorders = new Map(state.recorders);
        recorders.set(channelNumber, channelRecorder);
        return {
            ...state,
            recorders
        }
    },
    [SET_RECORDER_MOUNT]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {channelNumber, mountRecorder} = action.payload;
        const channelRecorder = {...state.recorders.get(channelNumber)};
        channelRecorder.mountRecorder = mountRecorder;
        const recorders = new Map(state.recorders);
        recorders.set(channelNumber, channelRecorder);
        return {
            ...state,
            recorders
        }
    },
    [SET_SCHEDULE_FUNCTION]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {channelNumber, scheduleFunction} = action.payload;
        const channelRecorder = {...state.recorders.get(channelNumber)};
        channelRecorder.scheduleFunction = scheduleFunction;
        const recorders = new Map(state.recorders);
        recorders.set(channelNumber, channelRecorder);
        return {
            ...state,
            recorders
        }
    },
    [SET_SCHEDULE_INTERVAL]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {channelNumber, scheduleInterval} = action.payload;
        const channelRecorder = {...state.recorders.get(channelNumber)};
        channelRecorder.scheduleInterval = scheduleInterval;
        const recorders = new Map(state.recorders);
        recorders.set(channelNumber, channelRecorder);
        return {
            ...state,
            recorders
        }
    },
    [SET_SCHEDULE_STATUS]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {channelNumber, scheduleStatus} = action.payload;
        const channelRecorder = {...state.recorders.get(channelNumber)};
        channelRecorder.scheduleStatus = scheduleStatus;
        const recorders = new Map(state.recorders);
        recorders.set(channelNumber, channelRecorder);
        return {
            ...state,
            recorders
        }
    },
    [SET_AUTO_START_SCHEDULE]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {channelNumber, autoStartSchedule} = action.payload;
        const channelRecorder = {...state.recorders.get(channelNumber)};
        channelRecorder.autoStartSchedule = autoStartSchedule;
        const recorders = new Map(state.recorders);
        recorders.set(channelNumber, channelRecorder);
        return {
            ...state,
            recorders
        }
    },
    [SAVE_PLAYER_HTTP_URL]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {channelNumber, playerHttpURL} = action.payload;
        const channelRecorder = {...state.recorders.get(channelNumber)};
        channelRecorder.playerHttpURL = playerHttpURL;
        const recorders = new Map(state.recorders);
        recorders.set(channelNumber, channelRecorder);
        return {
            ...state,
            recorders
        }
    },
}, initialState);