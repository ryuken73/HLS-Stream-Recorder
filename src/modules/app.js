import {createAction, handleActions} from 'redux-actions';

const {getCombinedConfig} = require('../lib/getConfig');
const config = getCombinedConfig({storeName:'optionStore', electronPath:'home'});
const {
    LOG_LEVEL="info",
    RECORD_MODE,
    CCTV_HOST,
    MAIL_RECEIVERS=['ryuken01@sbs.co.kr','110eel@sbs.co.kr'],
    MAIL_ADDRESS='10.10.16.77'
} = config;

import {initElectronLog, createElectronStore} from '../lib/electronUtil';
initElectronLog({
    fileLogLevel: LOG_LEVEL,
    consoleLogLevel: LOG_LEVEL
});

const {remote} = require('electron');

const sourceStore = createElectronStore({
    name:'sourceStore',
    cwd:remote.app.getPath('home')
});
const intervalStore = createElectronStore({
    name:'intervalStore',
    cwd:remote.app.getPath('home')
});

import {cctvFromConfig} from '../lib/getCCTVList';
const sources = cctvFromConfig();
console.log('####', sources);

// mailer setting
// const mailUtil = require('../utils/mailUtil');
import mailUtil from '../utils/mailUtil';
const wiseMail = mailUtil.connect({host:MAIL_ADDRESS});
wiseMail.setDefaultOptions({
    from: 'KBS CCTV noreply@sbs.co.kr',
    to: MAIL_RECEIVERS,
    subject: `HLS-Stream-Recorder Error`,
    html: 'Error ',
})

// action types
const SET_SOURCES = 'app/SET_SOURCES';
const SET_SOCKET = 'app/SET_SOCKET';

// redux thunk
export const bcastSetRecorders = socket => (dispatch, getState) => {
    const state = getState();
    const {hlsPlayers, hlsRecorders} = state;
    const {players} = hlsPlayers;
    const {recorders} = hlsRecorders;
    const aPlayers = [...players];
    const recordersStatus = aPlayers.map(([channelNumber, player]) => {
        const duration = recorders.get(channelNumber).duration;
        const recorderStatus = recorders.get(channelNumber).recorderStatus;
        const title = player.source.title;
        return {channelNumber, duration, recorderStatus, title}
    })
    console.log('socket:recorders', recordersStatus)
    socket.emit('set:recorders', {from: RECORD_MODE, recordersStatus})
}

// action creator
export const setSources = createAction(SET_SOURCES);
export const setSocket = createAction(SET_SOCKET);

const initialState = {
    sources,
    sourceStore,
    intervalStore,
    wiseMail,
    socket: null,
    recordMode: RECORD_MODE
}

// reducer
export default handleActions({
    [SET_SOURCES]: (state, action) => {
        const {sources} = action.payload;
        return {
            ...state,
            sources
        }
    },
    [SET_SOCKET]: (state, action) => {
        const {socket} = action.payload;
        return {
            ...state,
            socket
        }
    }
}, initialState);