const utils = require('../utils');
const {getAbsolutePath} = require('./electronUtil');
const {m3u8ToFileArray} = require('./tsFileUtil');
const {convertMP4} = require('./RecordHLS_ffmpeg');
const fs = require('fs');
const path = require('path');

const log = require('electron-log');
const appLog = (() => {
    return {
        debug : msg => log.debug(`[hlsToMP4]${msg}`),
        info  : msg => log.info(`[hlsToMP4]${msg}`),
        warn  : msg => log.warn(`[hlsToMP4]${msg}`),
        error : msg => log.error(`[hlsToMP4]${msg}`)
      }
})()

const HLStoMP4 = async clipData => {
    const {
        hlsm3u8, 
        hlsDirectory, 
        channelName, 
        mp4Name, 
        saveDirectory, 
        startTime, 
        duration
    } = clipData;

    try {
        appLog.info(`start merging ts files to one ts file: ${hlsDirectory}`);
        const tsFilesArray = await m3u8ToFileArray(hlsm3u8);
        const oneTSFile = path.join(hlsDirectory, `${channelName}.ts`);
        const result = await utils.file.concatFiles(tsFilesArray, oneTSFile);
        appLog.info(`new hls stream merged to one ts file: ${oneTSFile}`);
        const ffmpegPath = getAbsolutePath('bin/ffmpeg.exe', true);
        const durationNew = await convertMP4(oneTSFile, mp4Name, ffmpegPath);
        const durationSafeString = durationNew.replace(/:/g,';');  
        const mp4NameNew = path.join(saveDirectory, `${channelName}_${startTime}_[${durationSafeString}].mp4`);
        if(mp4Name !== mp4NameNew){
                appLog.warn(`converted mp4's duration differ from origial hls: original=${mp4Name} mp4 converted=${mp4NameNew}`);
                await fs.promises.rename(mp4Name, mp4NameNew);
        }
        appLog.info(`new hls stream successfully converted to mp4: ${mp4Name}`);
        const updatedClip = {...clipData, duration: durationNew, mp4Name: mp4NameNew, mp4Converted: true};
        return updatedClip;
    } catch(error) {
        appLog.error('error occurred in convertMP4');
        appLog.error(error);
        return false;
    }
}

export default {HLStoMP4}