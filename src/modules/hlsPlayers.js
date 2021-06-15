import {createAction, handleActions} from 'redux-actions';
// import {logInfo, logError, logFail} from './messagePanel';
import {cctvFromConfig} from '../lib/getCCTVList';
import {getEncryptedUrl} from '../lib/urlUtils';
// import {setSource} from './app';
const {getCombinedConfig} = require('../lib/getConfig');
const config = getCombinedConfig({storeName:'optionStore', electronPath:'home'});
const {
    NUMBER_OF_CHANNELS,
    CHANNEL_PREFIX,
    DEFAULT_PLAYER_PROPS,
    LONG_BUFFERING_MS_SECONDS=3000,
    // CCTV_HOST
} = config;

const sources = cctvFromConfig();
const MAX_PAGE_NUMBER = Math.ceil(sources.length / parseInt(NUMBER_OF_CHANNELS));

const mkOverlayContent = cctvId => {
    console.log(cctvId)
    const source = sources.find(source => source.cctvId === cctvId)
    if(source !== undefined){
        const {title} = source
        const element = document.createElement('div');
        element.innerHTML = title;
        element.style = "color:black;font-weight:bold";
        return element;
    }
    return false;
}

const players = new Map();
const {remote} = require('electron');

const Store = require('electron-store');
const sourceStore = new Store({
    name:'sourceStore',
    cwd:remote.app.getPath('home')
})

const getPlayerSourcesOfPage = pageNumber => {
    let startSourceNumber = parseInt(NUMBER_OF_CHANNELS) * (pageNumber-1) + 1;
    const IS_LAST_PAGE = parseInt(pageNumber) === MAX_PAGE_NUMBER;
    const modulus = sources.length % NUMBER_OF_CHANNELS;
    const numberOfPlayerslastPage = modulus === 0 ? NUMBER_OF_CHANNELS : modulus;
    const numberOfPagePlayer = IS_LAST_PAGE ? numberOfPlayerslastPage : NUMBER_OF_CHANNELS;
    const playerSourcesOfPage = [];
    for(let channelNumber=1;channelNumber<=numberOfPagePlayer;channelNumber++){
        const source = sourceStore.get(startSourceNumber.toString()) || sources[startSourceNumber-1];
        const url = getEncryptedUrl(source.cctvId);
        source.url = url;
        console.log('### source in hlsplayer:', source)
        const {cctvId} = source;
        playerSourcesOfPage.push({channelNumber, source, cctvId});
        startSourceNumber+=1
    }
    return playerSourcesOfPage;
}

// initialize player
const initializePage = pageNumber => {
    const playerSourcesOfPage = getPlayerSourcesOfPage(pageNumber);
    playerSourcesOfPage.forEach(playerSource => {
        const {channelNumber, source, cctvId} = playerSource;
        const hlsPlayer = {
            ...DEFAULT_PLAYER_PROPS,
            source,
            channelName: `${CHANNEL_PREFIX}${channelNumber}`,
            overlayContent: mkOverlayContent(cctvId),
            mountPlayer: true
        }
        players.set(channelNumber, hlsPlayer);
    })
}
const INITIAL_PAGE = 1;
initializePage(INITIAL_PAGE)


// action types
const SET_PLAYER = 'hlsPlayers/SET_PLAYER';
const SET_PLAYER_SOURCE = 'hlsPlayers/SET_PLAYER_SOURCE';
const SET_PLAYER_MOUNT = 'hlsPlayers/SET_PLAYER_MOUNT';
const REFRESH_PLAYER = 'hlsPlayers/REFRESH_PLAYER';
const SET_CURRENT_PAGE = 'hlsPlayers/SET_CURRENT_PAGE';

// action creator
export const setPlayer = createAction(SET_PLAYER);
export const setPlayerSource = createAction(SET_PLAYER_SOURCE);
export const setPlayerMount = createAction(SET_PLAYER_MOUNT);
export const refreshPlayer = createAction(REFRESH_PLAYER);
export const setCurrentPage = createAction(SET_CURRENT_PAGE);

// redux thunk
export const setSourceNSave = ({channelNumber, cctvId, url}) => (dispatch, getState) => {
    const state = getState();
    const {sourceStore} = state.app;
    const hlsPlayer = {...state.hlsPlayers.players.get(channelNumber)};

    const sourceNumber = sources.findIndex(source => source.cctvId === cctvId);
    const title = sourceNumber !== -1 ? sources[sourceNumber].title : hlsPlayer.source.title;
    
    sourceStore.set(channelNumber, {
        title, 
        cctvId
    })
    // dispatch(setSource({cctvId, url}))
    dispatch(setPlayerSource({channelNumber, url, cctvId}))
}

const getNextPage = currentPage => {
    return parseInt(currentPage) === MAX_PAGE_NUMBER ? 1 : parseInt(currentPage) + 1;
}

const getPrevPage = currentPage => {
    return parseInt(currentPage) === 1 ? parseInt(MAX_PAGE_NUMBER) : parseInt(currentPage) - 1;
}

export const goPage = ({direction='next'}) => (dispatch, getState) => {
    const state = getState();
    const {currentPage} = state.hlsPlayers;
    const pageToGo = direction === 'next' ? getNextPage(currentPage) : getPrevPage(currentPage);
    const playerSourcesOfPage = getPlayerSourcesOfPage(pageToGo);
    playerSourcesOfPage.forEach(playerSource => {
        const {channelNumber, source, cctvId} = playerSource;
        dispatch(setPlayerSource({channelNumber, url:source.url, cctvId}));
    })
    dispatch(setCurrentPage({currentPage: pageToGo}));
}

export const remountPlayer = ({channelNumber}) => (dispatch, getState) => {
    dispatch(setPlayerMount({channelNumber, mountPlayer:false}));
    setTimeout(() => {
        dispatch(setPlayerMount({channelNumber, mountPlayer:true}));
    },500)
}

const sleepms = (sleepTime) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, sleepTime)
    })
}
export const remountPlayerAll = () => (dispatch, getState) => {
    console.log('#### remountPlayerAll called')
    const state = getState();
    const {players} = state.hlsPlayers;
    const playersArray = [...players];
    console.log('#### remountPlayerAll called', playersArray)

    for(let index=0; index < playersArray.length ; index++){
        const channelNumber = playersArray[index][0];
        console.log('#####', channelNumber)
        setTimeout(() => {
            dispatch(remountPlayer({channelNumber}));
        }, index * 100)
    }    
}
export const setPlayerMountAll = ({mountPlayer}) => (dispatch, getState) => {
    console.log('#### setPlayerMountAll called')
    const state = getState();
    const {players} = state.hlsPlayers;
    const playersArray = [...players];
    for(let index=0; index < playersArray.length ; index++){
        const channelNumber = playersArray[index][0];
        setTimeout(() => {
            dispatch(setPlayerMount({channelNumber, mountPlayer}));
        }, index * 500)
    }
}

const initialState = {
    players,
    currentPage: INITIAL_PAGE,
    config:{
        LONG_BUFFERING_MS_SECONDS
    }
}

// reducer
export default handleActions({
    [SET_PLAYER]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {channelNumber, player} = action.payload;
        const hlsPlayer = {...state.players.get(channelNumber)};
        hlsPlayer.player = player;
        const players = new Map(state.players);
        players.set(channelNumber, hlsPlayer);
        return {
            ...state,
            players
        }
    },
    [SET_PLAYER_SOURCE]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {channelNumber, url, cctvId} = action.payload;
        const overlayContent = mkOverlayContent(cctvId);

        const sourceNumber = sources.findIndex(source => source.cctvId === cctvId);
        const hlsPlayer = {...state.players.get(channelNumber)};
        // to make state change, use spread operator on source;
        const source = {...hlsPlayer.source};
        source.url = url;
        source.cctvId = cctvId;
        source.title = sourceNumber !== -1 ? sources[sourceNumber].title : hlsPlayer.source.title;
        hlsPlayer.source = source;
        if(overlayContent) hlsPlayer.overlayContent = overlayContent;

        const players = new Map(state.players);

        players.set(channelNumber, hlsPlayer);
        return {
            ...state,
            players
        }
    },
    [SET_PLAYER_MOUNT]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {channelNumber, mountPlayer} = action.payload;
        const hlsPlayer = {...state.players.get(channelNumber)};
        // to make state change, use spread operator on source;
        hlsPlayer.mountPlayer = mountPlayer;
        state.players.set(channelNumber, hlsPlayer);
        const players = new Map(state.players);
        players.set(channelNumber, hlsPlayer);
        return {
            ...state,
            players
        }
    },
    [REFRESH_PLAYER]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {channelNumber} = action.payload;
        const hlsPlayer = {...state.players.get(channelNumber)};
        const url = hlsPlayer.source.url;
        const {player} = hlsPlayer;
        if(player === null) {
            console.log('player is null. not refresh!')
            return {state}
        }
        const srcObject = {
            src: url,
            type: hlsPlayer.type,
            handleManifestRedirects: true,
        }
        try {
            player.src(srcObject);
        } catch (err) {
            console.error('error when refresh player');
            return { ...state }
        }
        return { ...state }
    },
    [SET_CURRENT_PAGE]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {currentPage} = action.payload;
        return {
            ...state,
            currentPage
        }
    },
}, initialState);


