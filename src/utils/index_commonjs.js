const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');
const R = require('ramda');
const {
    listDir, 
    listDirR, 
    getCount, 
    appendStats, 
    grepDirectory,
    grepFile, 
    getSize, 
    toFullName, 
    tap, 
    errorTap
} = require('./fp.file_commonjs.js');

exports.number = {
    group1000(number){
        return new Intl.NumberFormat().format(number)
    },
    toByteUnit({number, unit='KB', point=0}){
        if(unit === 'KB') return (number/1024).toFixed(point);
        if(unit === 'MB') return (toByteUnit({number, unit:'KB',point})/1024).toFixed(point);
        if(unit === 'GB') return (toByteUnit({number, unit:'MB',point})/1024).toFixed(point);
        if(unit === 'TB') return (toByteUnit({number, unit:'GB',point})/1024).toFixed(point);
        return number;
    },
    padZero(num){
        if(num < 10){
            return `0${num}`;
        }
        return num.toString();
    }
}

exports.string = {
    toObject(string, itemSep, keySep){
        if(typeof(string) !== 'string') return {};
        const itemArray = string.replace(/^\?/,'').split(itemSep);
        return itemArray.reduce((parsedObj, item) => {
            const key = item.split(keySep)[0];
            const value = item.split(keySep)[1];
            // console.log('**',key,value)
            parsedObj[key] = value;
            return parsedObj
        },{})
    }
}

exports.clone = {
    replaceElement(array, index, newElement){
        return [
            ...array.slice(0, index),
            newElement,
            ...array.slice(index+1)
        ]
    }
}

exports.date = {
    getString(date, separator={}){
        const {
            dateSep='', 
            timeSep='', 
            sep='.'
        } = separator;
        const year = date.getFullYear();
        const month = number.padZero(date.getMonth() + 1);
        const day = number.padZero(date.getDate());
        const hour = number.padZero(date.getHours());
        const minute = number.padZero(date.getMinutes());
        const second = number.padZero(date.getSeconds());
        const dateString = `${year}${dateSep}${month}${dateSep}${day}`;
        const timeString = `${hour}${timeSep}${minute}${timeSep}${second}`;
        return `${dateString}${sep}${timeString}`;
    }
}

exports.file = {
    validType : {
        directory(dirname){
            if(typeof(dirname) === 'string') return true;
            return false;
        }
    },
    toSafeFileNameWin(filename, replacer='-'){
        const regExp = new RegExp(/[?*><"|:\\/]/g);
        return filename.replace(regExp, replacer)
    },
    async delete(fname){
        return fs.promises.unlink(fname);
    },
    async deleteFiles(baseDirectory, regexp){
        try {
            const files = await fs.promises.readdir(baseDirectory);
            const deleteJob = files.map(file => {
                const fullName = path.join(baseDirectory, file);
                if(regexp.test(fullName)){
                    return fs.promises.unlink(fullName);
                }
                return Promise.resolve(true);
            })
            return Promise.all(deleteJob)
        } catch(err) {
            Promise.reject(err);
        }
    },
    async move(srcFile, dstFile){
        const dstDirectory = path.dirname(dstFile);
        await file.makeDirectory(dstDirectory);
        if(!await file.checkDirExists(dstDirectory)) {
            console.error('target directory to move does not exit');
            return Promise.reject(`directory doesn't exists and creating directory failed. [${dstDirectory}]`);
        }
        try {
            console.log(`dstDirExists : ${dstDirectory}`);
            await fs.promises.rename(srcFile, dstFile); 
            return true            
        } catch (error) {
            console.error(error);
            if(error.code === 'EXDEV'){
                await fs.promises.copyFile(srcFile, dstFile);
                await fs.promises.unlink(srcFile);
                return true;
            } else {
                throw error;
            }
        }
    },
    async copy(srcFile, dstFile){
        const dstDirectory = path.dirname();
        await file.makeDirectory(dstDirectory);
        if(!await file.checkDirExists(dstDirectory)) {
            console.error('target directory to move does not exit');
            return Promise.reject(`directory doesn't exists and creating directory failed. [${dstDirectory}]`);
        }
        return fs.promises.copyFile(srcFile, dstFile);
    },
    checkDirWritable({dirname}){
        return new Promise((resolve, reject) => {
            fs.access(dirname, fs.constants.W_OK, function(err) {
                if(err){
                  console.error(`cannot write ${dirname}`);
                  reject(err);
                  return;
                }          
                console.log(`can write ${dirname}`);
                resolve(true);
                return;
            });
        })
    },
    checkDirExists(dirname){
        return new Promise((resolve, reject) => {
            if(!file.validType.directory(dirname)){
                resolve(false);
                return
            }
            fs.lstat(dirname, (err, stats) => {
                if(err) {
                    resolve(false);
                    return
                }
                stats.isDirectory() && resolve(true);
                !stats.isDirectory() && resolve(false);
            })
        })
    },
    async makeDirectory(dirname){
        if(!file.validType.directory(dirname)){
            return Promise.reject(false);
        }
        try {
            mkdirp(dirname);
        } catch (err) {
            console.log(err)
            return Promise.reject(false);            
        }
    },
    async concatFiles(inFiles, outFile){
        try {
            const getNext =  getNextFile(inFiles);
            let inFile = getNext();
            const wStream = fs.createWriteStream(outFile);
            while(inFile !== undefined){
                console.log(`processing...${inFile}`);
                const rStream = fs.createReadStream(inFile);
                await appendToWriteStream(rStream, wStream);
                inFile = getNext();
            }
            wStream.close();
            return;
        } catch(error) {
            // console.error('some errors:')
            throw new Error(error);
            console.error(error)
        }
    },
    getFileCountR: R.pipe(
        listDirR, 
        R.andThen(grepFile),
        R.andThen(getCount)
    ),    
    getDirectoryCountR: R.pipe(
        listDirR, 
        R.andThen(grepDirectory),
        R.andThen(getCount)
    ),
    getTotalSizeR: R.pipe(
        listDirR, 
        R.andThen(appendStats),
        R.andThen(getSize)
    ),
    getDirListR: R.pipe(
        listDirR,
        R.andThen(grepDirectory),
        R.andThen(appendStats),
        R.andThen(toFullName)
        // R.andThen(tap)
    ),
    getFileListR: R.pipe(
        listDirR,
        R.andThen(grepFile),
        R.andThen(appendStats),
        R.andThen(toFullName)
        // R.andThen(tap)
    )
}

exports.fp = {
    throttle(duration, fn){
        let timer = null;
        return (...args) => {
            if(timer === null){
                timer = setTimeout(() => {
                    fn(...args);
                    timer = null;
                }, duration)
            }
        }
    },
    debounce(duration, fn){
        let timer = null;
        return (...args) => {
            if(timer) clearTimeout(timer);
            timer = setTimeout(() => {
                fn(...args);
                timer = null;
            }, duration)
        }
    },
    throttleButLastDebounce(throttleDuration, fn){
        let throttleTimer = null;
        let debounceTimer = null;
        return (...args) => {
            if(debounceTimer) clearTimeout(debounceTimer);
            if(throttleTimer === null){
                throttleTimer = setTimeout(() => {
                    fn(...args);
                    throttleTimer = null;
                }, throttleDuration)
            } 
            debounceTimer = setTimeout(() => {
                fn(...args);
                debounceTimer = null;
            }, throttleDuration + 100)


        }
    },
    times(fn, {count=10, sleep=0}){
        let processed = 0;
        return (...args) => {
            const timer = setInterval(() => {
                console.log(processed);
                if(processed > count) {
                    clearInterval(timer);
                    return
                }
                fn(...args)
                processed++
            , sleep})
        }

    },  
    delayedExecute(fn, delay){
        return async (...args) => {
            return new Promise((resolve, reject) => {
                try {
                    setTimeout(() => {
                        const result = fn(...args);
                        resolve(result);        
                    }, delay)
                } catch(err) {
                    reject(err);
                }
            })
        }
    }  
}

const getNextFile = inFiles => {
    return () => inFiles.shift()
}

const appendToWriteStream = async (rStream, wStream) => {
    return new Promise((resolve, reject) => {
        try {
            rStream.on('data', data => wStream.write(data));
            rStream.on('end', () => resolve(true));
        } catch (error) {
            reject(error);
        }
    })
}

exports.browserStorage = {
    storage : null,
    // storageAvailable : (type) => {
    init : (type) => {
        try {
            const storage = window[type];
            const TEST_TEXT = 'setItem test';
            storage.setItem('testText', TEST_TEXT);
            storage.removeItem('testText');
            console.log(this)
            browserStorage._use(type);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    },
    _use : type => this.storage = window[type],
    get : key => this.storage.getItem(key),
    set : (key, value) => this.storage.setItem(key, value),
    delete : key => this.storage.removeItem(key),
    clear: () => this.storage.clear()
}

const sortBy = (a,b) => {
	return key => {
		// if key value is empty, push back
		if(a[key] === '') return 1;
		if(b[key] === '') return -1;
		// normal order
		if(a[key] > b[key]) return 1;
		if(a[key] < b[key]) return -1;
		return false
	}
}

exports.order = {
    orderByKey: (keyName) => {
        return (a,b) => {
            const sortByKey = sortBy(a,b);
            const result = sortByKey(keyName);
            return result;
        }
    }
}

// const orderTest = [
//     {name:'ryu', age:10},
//     {name:'ken', age:50},
//     {name:'kim', age:49},
//     {name:'anne', age:16},
//     {name:'andy', age:19},
// ]

// console.log(sort(order.orderByKey('name')))
// console.log(sort(order.orderByKey('age')))

// export default {
//     browserStorage,
//     clone,
//     fp,
//     file,
//     number,
//     date,
//     string
// }

// const trottled = fp.throttle(100, console.log);
// const looplog = fp.times(trottled, {count:100, sleep:100});
// looplog('ryuken')

// const main = async () => {
//     const targetDirectory = 'd:/temp/a|b';
//     // console.log(await file.checkDirExists('C:/'));
//     // console.log(await file.checkDirExists('C:/temp'));
//     // console.log(await file.checkDirExists('d:/ttt'));
//     // console.log(await file.checkDirExists({}));
//     console.log(await file.checkDirExists(targetDirectory));

//     console.log(await file.makeDirectory(targetDirectory));
//     console.log(await file.checkDirExists(targetDirectory));

// }