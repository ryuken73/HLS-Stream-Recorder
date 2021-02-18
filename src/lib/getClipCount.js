

const {getCombinedConfig} = require('./getConfig');
const config = getCombinedConfig({storeName:'optionStore', electronPath:'home'});

const {
    NUMBER_OF_CHANNELS,
} = config;

import {remote} from 'electron';
const Store = require('electron-store');
const clipStore = new Store({
    name:'clipStore',
    cwd:remote.app.getPath('home')
})

export const getChannelClipCountInStore = channelNumber => {
    const allClips = clipStore.store;
    const count = Object.entries(allClips).filter(([id, clipInfo]) => {
        return clipInfo.channelNumber === channelNumber
    }).length
    return count;
}

const fs = require('fs');
const path = require('path');
export const getChannelClipCountInDirectory = (state, channelNumber) => {
    return new Promise((resolve, reject) => {
        try {
            const channelRecorder = state.hlsRecorders.recorders.get(channelNumber);
            const saveFolder = channelRecorder.channelDirectory;
            const {localm3u8} = channelRecorder;
            fs.readdir(saveFolder, (err, files) => {
                // console.log(`@@@ channelNumber=${channelNumber} localm3u8=${localm3u8} allFolderCount=${files.length}`)
                const countInFolder = localm3u8 === null ? files.length : files.filter(file => {
                    const currentFolder = path.join(saveFolder, file);
                    const currentRecordingFolder = path.dirname(localm3u8);
                    // currentFolder === currentRecordingFolder && console.log(`@@@ currentFolder=${currentFolder} currentRecordingFolder=${currentRecordingFolder} ${currentFolder !== currentRecordingFolder}`)
                    return currentFolder !== currentRecordingFolder
                }).length;
                // console.log(`@@@ countInFolder=${countInFolder}`);
                resolve(countInFolder);
            })
        } catch (err) {
            console.error(err);            
        }

    })
}

export const getTotalClipInStore = () => {
    let totalCount = 0;
    for(let channelNumber=1; channelNumber <= NUMBER_OF_CHANNELS; channelNumber++){
        const channelClipCountInStore = getChannelClipCountInStore(channelNumber);
        totalCount += channelClipCountInStore;
    }
    return totalCount;
}

export const getTotalClipInFolder = async state => {
    return new Promise((resolve, reject) => {
        const {recorders} = state.hlsRecorders
        const getCountInSubDir = [...recorders].map(async ([channelNumber, recorder]) => {
            return await getChannelClipCountInDirectory(state, channelNumber);
        })
        Promise.all(getCountInSubDir)
        .then(clipCounts => {
            const totalCounts = clipCounts.reduce((total, count) => {
                return total + count;                
            }, 0)
            resolve(totalCounts);
        })
    })
}

// module.exports = {
//     getChannelClipCountInStore,
//     getChannelClipCountInDirectory,
//     getTotalClipInStore,
//     getTotalClipInFolder
// }