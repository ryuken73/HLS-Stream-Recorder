const fs = require('fs');
const path = require('path');
const readline = require('readline');

export const readByLine = (inFile, callback) => {
    const rStream = fs.createReadStream(inFile);
    const rl = readline.createInterface({input:rStream});
    rl.on('line', line => {
        if(callback){
            callback({done:false, data:line});
            return
        }
        console.log(line);
    })
    rl.on('close', () => {
        if(callback){
            callback({done:true})
        }
        console.log('File read End')
    })
}

export const m3u8ToFileArray = (m3u8File, baseDirectory) => {
    if(baseDirectory === undefined){
        baseDirectory = path.dirname(m3u8File);
    }
    const regExp = new RegExp(/^channel.*ts$/);
    const files = [];
    return new Promise((resolve, reject) => {
        readByLine(m3u8File, result => {
            const {done, data} = result;
            if(done) {
                resolve(files)
                return;
            }
            if(regExp.test(data)){
                files.push(path.join(baseDirectory, data));
            }            
        })
    })
}

// functions for add_X_ENDLIST
const getLastLine = string => {
    const lastSpaceRemoved = string.replace(/\s+$/, '')
    const regPattern = new RegExp(/\n(.*)$/);
    const match = lastSpaceRemoved.match(regPattern);
    if(match === null){
        return null;
    }
    return match[1]
}

const addLastLine = async (fname, line) => {
    return await fs.promises.appendFile(fname, line)
}
//

export const add_X_ENDLIST = async m3u8 => {
    const data = await fs.promises.readFile(m3u8);
    const tsFileStrings = data.toString();
    const lastLine = getLastLine(tsFileStrings);
    if(lastLine === '#EXT-X-ENDLIST'){
        console.log('not need')
        return false;
    }
    await addLastLine(m3u8, '#EXT-X-ENDLIST\n')
    return true;
}

// const main = async () => {
//     const m3u8 = 'c:/temp/channel1/0f8e68fa-6fd9-4521-b034-7568f5bfbf71/channel1_stream.m3u8';
//     const baseDirectory = 'c:/temp/channel1/0f8e68fa-6fd9-4521-b034-7568f5bfbf71';
//     const files = await m3u8ToFileArray(m3u8);
//     console.log(files)
// }

// main()

// export default {
//     m3u8ToFileArray,
//     add_X_ENDLIST
// }

