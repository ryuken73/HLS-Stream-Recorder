import {createAction, handleActions} from 'redux-actions';

const {getCombinedConfig} = require('../lib/getConfig');
const config = getCombinedConfig({storeName:'optionStore', electronPath:'home'});
const {
    LOG_LEVEL="info"
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

// action types
const SET_SOURCES = 'app/SET_SOURCES';

// action creator
export const setSources = createAction(SET_SOURCES);

const initialState = {
    sources,
    sourceStore,
    intervalStore
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
}, initialState);