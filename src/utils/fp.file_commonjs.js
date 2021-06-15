const R = require('ramda');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

class DirectoryEntry {
    constructor(baseDir, fsEntries){
        this.baseDir = baseDir;
        this.fsEntries = fsEntries;
        this.fullNames = fsEntries.map(fsEntry => path.join(baseDir,fsEntry.name));
        this.stats = null;
    }

    get files(){
        const fileEntries = this.fsEntries.filter(fsEntry => fsEntry.isFile());
        if(fileEntries.length === 0){
            return null;
        }
        return new DirectoryEntry(this.baseDir, fileEntries);
    }

    get dirs(){
        const dirEntries = this.fsEntries.filter(fsEntry => fsEntry.isDirectory());
        if(dirEntries.length === 0){
            return null;
        }
        return new DirectoryEntry(this.baseDir, dirEntries);
    }

    get size(){
        return this.stats.reduce((totalSize, {name, stats}) => {
            return totalSize + stats.size;
        },0)
    }

    makeStats = async (index) => {
        if(this.stats !== null){
            index % 100 === 0 && console.log('cache match processed : ', index);
            return Promise.resolve()
        }
        const getStatsJobs = this.fullNames.map(async fullName => {
            const fstats = await fs.promises.stat(fullName);
            return {name:fullName, stats: fstats}
        })
        const stats = await Promise.all(getStatsJobs);
        this.stats = stats;
        index % 100 === 0 && console.log('cache miss processed : ', index);
        return 
    }
}

const listDir = async directory => {
    try {
        const fsEntries = await fs.promises.readdir(directory, {withFileTypes: true});
        const baseDir = directory;
        return [new DirectoryEntry(baseDir, fsEntries)];
    } catch (error) {
        throw new Error(error)
    }
}

const listDirR = async directory => {
    try {
        const fsEntries = await fs.promises.readdir(directory, {withFileTypes: true});
        const baseDir = directory;
        const directoryEntriesCurrent = new DirectoryEntry(baseDir, fsEntries);
        const directoryEntriesSubDirs = await Promise.all(fsEntries.filter(fsEntry => fsEntry.isDirectory()).map(async fsEntry => {
            const subDirName = path.join(baseDir, fsEntry.name);
            const directoryEntriesSubDir = await listDirR(subDirName);
            return directoryEntriesSubDir 
        }));
        return [directoryEntriesCurrent, ...directoryEntriesSubDirs.flat()];
    } catch (error) {
        throw new Error(error)
    }
}

const getCount = directoryEntries => {
    return directoryEntries.reduce((count, directoryEntry) => {
        return count + directoryEntry.fsEntries.length
    }, 0)
}

const appendStats = async directoryEntries => {
    const appended = await directoryEntries.map(async (directoryEntry, index) => {
        await directoryEntry.makeStats(index);
        return directoryEntry;
    })
    return await Promise.all(appended);
}

const grepDirectory = directoryEntries => {
    return directoryEntries.map(directoryEntry => directoryEntry.dirs).filter(entry => entry !== null)
}

const grepFile = directoryEntries => {
    return directoryEntries.map(directoryEntry => directoryEntry.files).filter(entry => entry !== null)
}

const getSize = directoryEntries => {
    return directoryEntries.reduce((totalSize, directoryEntry) => {
        return totalSize + directoryEntry.size;
    }, 0)
}

const toFullName = directoryEntries => {
    // console.log('in toFullName:', directoryEntries[0].fullNames)
    const fullNamesArray = directoryEntries.map(directoryEntry => directoryEntry.fullNames);
    return fullNamesArray.flat();
}

const applyCondition = (selectFunction) => {
    return files => {
        const filtered = files.filter(selectFunction)
        return filtered;
    }
}

const tap = value => {
    console.log(value);
    return value;
}

const errorTap = value => {
    console.log('error:', value)
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

const deleteFile = fileWithStats => {
    return new Promise((resolve, reject) => {
        console.log(`[deleteFile]delete start: ${fileWithStats.name}`);
        const result = [];
        rimraf(fileWithStats.name, err => {
            if(err) {
                resolve({file:fileWithStats.name, delete:false});
                return
            }
            console.log(`[deleteFile]delete end: ${fileWithStats.name}`);
            resolve({file:fileWithStats.name, delete:true});
        })
    })
}

const deleteFiles = files => {
    const deleteJob = files.map(async fileWithStats => {
        return await deleteFile(file) 
    })
    return Promise.all(deleteJob);
}

const getFileCountR = R.pipe(
    listDirR, 
    R.andThen(grepFile),
    R.andThen(getCount)
)

const getDirectoryCountR = R.pipe(
    listDirR, 
    R.andThen(grepDirectory),
    R.andThen(getCount)
)

const getTotalSizeR = R.pipe(
    listDirR, 
    R.andThen(appendStats),
    R.andThen(getSize)
)

const getDirListR = R.pipe(
    listDirR,
    R.andThen(grepDirectory),
    R.andThen(appendStats),
    R.andThen(toFullName)
    // R.andThen(tap)
)

const getFileListR = R.pipe(
    listDirR,
    R.andThen(grepFile),
    R.andThen(appendStats),
    R.andThen(toFullName)
    // R.andThen(tap)
)

module.exports = {
    getFileCountR,
    getDirectoryCountR,
    getTotalSizeR,
    getDirListR,
    getFileListR
}
