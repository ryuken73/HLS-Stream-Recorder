const getTitle = (channelNumber, players) => {
    return players.get(channelNumber).source.title;
}

const getDuration = (channelNumber, recorders) => {
    return recorders.get(channelNumber).duration;
}

const getRecorderStatus = (channelNumber, recorders) => {
    return recorders.get(channelNumber).recorderStatus;
}

const getScheduleStatus = (channelNumber, recorders) => {
    return recorders.get(channelNumber).scheduleStatus;
}

const socketBcast = store => next => action => {
    const {type, payload} = action;
    const state = store.getState();
    const {socket, sources, recordMode} = state.app;
    const {players} = state.hlsPlayers;
    const {recorders} = state.hlsRecorders;

    if(socket === null || socket.disconnected){
        const result = next(action);
        return result;
    }

    let channelNumber, recorderStatus, duration, title;

    if(type === 'hlsPlayers/SET_PLAYER_SOURCE'){
        const {cctvId} = payload;
        const source = sources.find(source => source.cctvId === cctvId);
        title = source.title;
        channelNumber = payload.channelNumber;
        recorderStatus = getRecorderStatus(channelNumber, recorders);
        scheduleStatus = getScheduleStatus(channelNumber, recorders);
        duration = getDuration(channelNumber, recorders);        
    }
    if(type === 'hlsRecorders/SET_RECORDER_STATUS'){
        channelNumber = payload.channelNumber;
        recorderStatus = payload.recorderStatus;
        title = getTitle(channelNumber, players);
        duration = getDuration(channelNumber, recorders);        
        scheduleStatus = getScheduleStatus(channelNumber, recorders);
    }
    if(type === 'hlsRecorders/SET_DURATION'){
        channelNumber = payload.channelNumber;
        duration = payload.duration;
        title = getTitle(channelNumber, players);
        recorderStatus = getRecorderStatus(channelNumber, recorders);
        scheduleStatus = getScheduleStatus(channelNumber, recorders);
    }

    if(channelNumber !== undefined){
        const data = {
            channelNumber,
            recorderStatus,
            scheduleStatus,
            duration,
            title,
            type
        }
        socket.emit('update:recorder',{from: recordMode, recorderStatus: data})    
    }

    const result = next(action);
    return result;
}

export default socketBcast;