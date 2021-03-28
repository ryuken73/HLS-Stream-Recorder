import {
    getChannelClipCountInStore,
    getChannelClipCountInDirectory,
    getTotalClipInStore,
    getTotalClipInFolder
} from './getClipCount';

import {
    sendAppMessage,
    sendChannelMessage
} from './sendMessage';

const notify = store => next => action => {
    const {type, payload} = action;
    const state = store.getState();
    const {appStat, channelStats} = state.statistics;
    const {channelNumber, statName, value} = payload;

    if(type === 'statistics/SET_APP_STAT'){
        const statusReport = {
            name: statName,
            value
        }
        sendAppMessage(statusReport);
    }
    if(type === 'statistics/INCREASE_APP_STAT'){
        const value = appStat[statName] + 1;
        const statusReport = {
            name: statName,
            value
        }
        sendAppMessage(statusReport);
    }
    if(type === 'statistics/SET_CHANNEL_STAT'){
        const hlsPlayer = {...state.hlsPlayers.players.get(channelNumber)};
        const {title} = hlsPlayer.source;
        const statusReport = {
            title: title,
            name: statName,
            value
        }
        sendChannelMessage(channelNumber, statusReport); 
    }
    if(type === 'statistics/INCREASE_CHANNEL_STAT'){
        const value = channelStats[channelNumber][statName] + 1;
        const hlsPlayer = {...state.hlsPlayers.players.get(channelNumber)};
        const {title} = hlsPlayer.source;
        const statusReport = {
            title: title,
            name: statName,
            value
        }
        sendChannelMessage(channelNumber, statusReport); 
    }    
    // console.log(action);
    const result = next(action);
    return result;
}

export default notify;