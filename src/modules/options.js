import {createAction, handleActions} from 'redux-actions';
const Store = require('electron-store');

// const {remote} = require('electron');
// const optionStore = new Store({
//     name:'optionStore',
//     cwd:remote.app.getPath('home')
// })

const MAX_NUMBER_OF_CHANNEL = 10;

// action types
const SET_CONFIG = 'options/SET_CONFIG';
const SET_OPTIONS_DIALOG_OPEN = 'options/SET_OPTIONS_DIALOG_OPEN';
const SET_CONFIG_VALUE = 'options/SET_CONFIG_VALUE';

// action creator
export const setConfig = createAction(SET_CONFIG);
export const setConfigValue = createAction(SET_CONFIG_VALUE);
export const setOptionsDialogOpen = createAction(SET_OPTIONS_DIALOG_OPEN);

// redux thunk
import {getCombinedConfig, getDefaultConfig, getStore, mergeConfig}  from '../lib/getConfig';
import {getAbsolutePath, readJSONFile} from '../lib/electronUtil';

const optionStore = getStore({storeName:'optionStore', electronPath:'home'});
const defaultJsonFile = getAbsolutePath('config/default/config.json', true);
const defaultJsonConfig = readJSONFile(defaultJsonFile);

export const openOptionsDialog = () => (dispatch, getState) => {
    // const config = getCombinedConfig({storeName:'optionStore', electronPath:'home'});
    const storeJsonConfig = optionStore.store;
    const config = mergeConfig(storeJsonConfig, defaultJsonConfig);
    dispatch(setConfig({config}));
    dispatch(setOptionsDialogOpen({dialogOpen:true}))
}

export const setDefaultConfig = () => (dispatch, getState) => {
    const defaultConfig = getDefaultConfig();
    dispatch(setConfig({config:defaultConfig}));
}

export const saveConfig = ({config}) => (dispatch, getState) => {
    optionStore.store = config;
}

const initialConfig = getCombinedConfig({storeName:'optionStore', electronPath:'home'});

const initialState = {
    config: initialConfig,
    optionsDialogOpen:false
}

// reducer
export default handleActions({
    [SET_CONFIG]: (state, action) => {
        const {config} = action.payload;
        return {
            ...state,
            config,
        }
    },
    [SET_CONFIG_VALUE]: (state, action) => {
        const {configName, value} = action.payload;
        const config = {...state.config};
        config[configName] = value;
        return {
            ...state,
            config,
        }
    },
    [SET_OPTIONS_DIALOG_OPEN]: (state, action) => {
        const {dialogOpen} = action.payload;
        return {
            ...state,
            optionsDialogOpen:dialogOpen
        }
    },
}, initialState);