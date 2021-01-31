import {createAction, handleActions} from 'redux-actions';
 
const {getCombinedConfig} = require('../lib/getConfig');
const config = getCombinedConfig({storeName:'optionStore', electronPath:'home'});

const {
    NUMBER_OF_CHANNELS
} = config;

const arrayBetween = (from, to) => {
    const resultArray = [];
    for(let i=from;i<=to;i++){
        resultArray.push(i)
    }
    return resultArray;
}

const channels = arrayBetween(1, NUMBER_OF_CHANNELS)

// action types
const SET_CHANNELS = 'body/SET_CHANNELS';

// action creator
export const setChannels = createAction(SET_CHANNELS);

const initialState = {
    channels
}

// reducer
export default handleActions({
    [SET_CHANNELS]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {channels} = action.payload;
        return {
            channels
        }
    },
}, initialState);