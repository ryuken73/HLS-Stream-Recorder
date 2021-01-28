import {createAction, handleActions} from 'redux-actions';

// action types
const SET_SOURCES = 'app/SET_SOURCES';

// action creator
export const setSources = createAction(SET_SOURCES);

const initialState = {
    sources: ['ryu', 'ken']
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