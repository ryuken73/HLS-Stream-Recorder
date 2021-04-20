import {createAction, handleActions} from 'redux-actions';
import {encryptUrl} from '../lib/encryptUrl';

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
const sources = cctvFromConfig(CCTV_HOST);
console.log('####', sources);

// action types
const SET_SOURCES = 'app/SET_SOURCES';

// action creator
export const setSources = createAction(SET_SOURCES);

// redux thunk
export const refreshSourceUrl = cctvId => (dispatch, getState) => {
    const state = getState();
    const {sources} = state.app;
    const newUrl = encryptUrl(CCTV_HOST, cctvId);
    const oldSource = sources.find(source => source.cctvId === cctvId);
    const sourceIndex = sources.findIndex(source => source.cctvId === cctvId);
    const newSources = [...sources.slice(0, sourceIndex), {...oldSource, url: newUrl} ,...sources.slice(sourceIndex+1)];
    dispatch(setSources({sources:newSources}));
}

const initialState = {
    cctvHost: CCTV_HOST,
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