import {createAction, handleActions} from 'redux-actions';

const {getCombinedConfig} = require('../lib/getConfig');
const config = getCombinedConfig({storeName:'optionStore', electronPath:'home'});
const {
    LOG_LEVEL="info",
    CCTV_HOST
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
const wiseMail = mailUtil.connect({host:'10.10.16.77'});
wiseMail.setDefaultOptions({
    from: 'KBS CCTV noreply@sbs.co.kr',
    to: ['ryuken01@sbs.co.kr','110eel@sbs.co.kr'],
    subject: `HLS-Stream-Recorder Error`,
    html: 'Error ',
})

// action types
const SET_SOURCES = 'app/SET_SOURCES';
// const SET_SOURCE = 'app/SET_SOURCE';

// action creator
export const setSources = createAction(SET_SOURCES);

const initialState = {
    // cctvHost: CCTV_HOST,
    sources,
    sourceStore,
    intervalStore,
    wiseMail
}

// reducer
export default handleActions({
    [SET_SOURCES]: (state, action) => {
        const {sources} = action.payload;
        return {
            ...state,
            sources
        }
    }
}, initialState);