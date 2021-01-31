const fs = require('fs');
const path = require('path');
const readline = require('readline');

const readByLine = (inFile, callback) => {
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

const m3u8ToFileArray = (m3u8File, baseDirectory) => {
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

// const main = async () => {
//     const m3u8 = 'c:/temp/channel1/0f8e68fa-6fd9-4521-b034-7568f5bfbf71/channel1_stream.m3u8';
//     const baseDirectory = 'c:/temp/channel1/0f8e68fa-6fd9-4521-b034-7568f5bfbf71';
//     const files = await m3u8ToFileArray(m3u8);
//     console.log(files)
// }

// main()

export default {
    m3u8ToFileArray
}

