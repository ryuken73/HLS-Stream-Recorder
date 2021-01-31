const R = require('ramda');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

const scanDir = async directory => {
    try {
        const fsEntries = await fs.promises.readdir(directory, {withFileTypes: true});
        const baseDir = directory;
        return {baseDir, fsEntries};
    } catch (error) {
        throw new Error(error)
    }
}

const selectDirectories = ({baseDir, fsEntries}) => {
    const dirEntries = fsEntries.filter(fsEntry => fsEntry.isDirectory());
    return {baseDir, fsEntries: dirEntries};
}

const entriesToStats = ({baseDir, fsEntries}) => {
    const stats = fsEntries.map(async fsEntry => {
        const fstats = await fs.promises.stat(path.join(baseDir, fsEntry.name));
        return {name:path.join(baseDir, fsEntry.name), stats: fstats}
    })
    return Promise.all(stats)
}

const applyCondition = (selectFunction) => {
    return files => {
        const filtered = files.filter(file => selectFunction(file))
        return filtered;
    }
}

const tap = value => {
    return value;
}

const errorTap = value => {
    console.log('error:', value);
    return [];
}

const selectAll = file => true;
const selectNone = file => false;
const selectChannel6 = file => {
    const regExp = new RegExp(/.*channel10$/);
    return regExp.test(file.name)
};

const olderThan = seconds => {
    return file => {
        return (Date.now() - file.stats.mtime) / 1000 > seconds
    }
}

const deleteFile = file => {
    return new Promise((resolve, reject) => {
        console.log(`[deleteFile]delete start: ${file.name}`);
        const result = [];
        rimraf(file.name, err => {
            if(err) {
                resolve({file:file.name, deleted:false});
                return
            }
            console.log(`[deleteFile]delete end: ${file.name}`);
            resolve({file:file.name, deleted:true});
        })
    })
}

const deleteDirectory = files => {
    const deleteJob = files.map(async file => {
        return await deleteFile(file) 
    })
    return Promise.all(deleteJob);
}

// deleteDrectoryR('d:/temp/cctv/channel7/working');
export const deleteDirectoryR = async (directory, seconds) => {
    console.log(`[deleteFile]deleteR : seconds=${seconds}`)
    const deleteSubDirectory = R.pipe(
        scanDir, 
        R.andThen(selectDirectories),
        R.andThen(entriesToStats),
        R.andThen(applyCondition(olderThan(seconds))),
        R.andThen(deleteDirectory),
        R.andThen(tap),
        R.otherwise(errorTap)
    )
    return await deleteSubDirectory(directory);
}
