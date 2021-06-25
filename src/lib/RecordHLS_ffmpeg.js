const EventEmitter = require('events');
const utils = require('../utils');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const log = require('electron-log');

// const hlsInputOptions = ['-dts_delta_threshold', 0] // fornt part of clip not playable
const hlsInputOptions = ['-dts_delta_threshold', 10];
const mp4Options = ['-acodec', 'copy', '-vcodec', 'copy'];;
const hlsOptions = ['-f','hls', '-hls_time', 4, '-hls_list_size','0','-g',25,'-sc_threshold',0,'-preset','ultrafast','-vsync',2];
// const hlsOptions = ['-f','hls','-hls_time','8','-hls_list_size','10','-hls_flags','delete_segments','-g',25,'-sc_threshold',0,'-preset','ultrafast','-vsync',2];

const sameAsBefore = initialValue => {
    let previousValue = initialValue;
    return currentValue => {
        if(previousValue !== currentValue){
            previousValue = currentValue;
            return false;
        }
        return true;
    }
}

const successiveEvent = (checkFunction,logger=console) => {
    let occurred = 0;
    return (value, limit) => {
        if(checkFunction(value)){
            occurred ++;
        } else {
            occurred = 0;
        }
        if(occurred === limit){
            return true;
        }
        logger.debug(`check successiveEvent : ${value} - ${occurred}`);
        return false;   
    }
}

const FFMPEG_QUIT_TIMEOUT = 3000
class RecoderHLS extends EventEmitter {
    constructor(options){
        super();
        const {
            name='channel1',
            src='', 
            target='target.mp4', 
            enablePlayback=false, 
            localm3u8='./temp/stream.m3u8',
            ffmpegBinary='./ffmpeg.exe',
            renameDoneFile=false,
            successive_duration_limit=5,
            tooOftenEnded=()=>{return [9999, false]},
            tooFastEndMS=10000
        } = options;
        this._name = name;
        this._src = src;
        this._target = target;
        this._createTime = Date.now();
        this._enablePlayback = enablePlayback;
        this._localm3u8 = localm3u8;
        this._ffmpegBinary = ffmpegBinary;
        this._renameDoneFile = renameDoneFile;
        this._killTimer = null;
        this._exitByTimeout = false;
        this._tooOftenEnded = tooOftenEnded;
        this._tooFastEndMs = tooFastEndMS;
        ffmpeg.setFfmpegPath(this._ffmpegBinary);
        this.log = (() => {
            return {
                debug : msg => log.debug(`[${this._name}][RecordHLS_ffmpeg]${msg}`),
                info  : msg => log.info(`[${this._name}][RecordHLS_ffmpeg]${msg}`),
                warn  : msg => log.warn(`[${this._name}][RecordHLS_ffmpeg]${msg}`),
                error : msg => log.error(`[${this._name}][RecordHLS_ffmpeg]${msg}`)
              }
        })()
        this.INITIAL_TIMEMARKER =  '00:00:00.00';
        this.CRITICAL_SUCCESSIVE_OCCUR_COUNT = successive_duration_limit;
        const checkFunction = sameAsBefore(this.INITIAL_TIMEMARKER);
        this.checkSuccessiveEvent = successiveEvent(checkFunction, this.log);
        this.initialize();
    }

    initialize = () => {
        this._isPreparing = false;
        this._isRecording = false;
        this._bytesRecorded = 0;
        this._durationRecorded = this.INITIAL_TIMEMARKER;
        this._startTime = null;
        this._rStream = null;
        this._localm3u8 = null;
        this._command = null;
        this._killTimer = null;
        this._exitByTimeout = false;
        
        this.log.info(`recoder initialized...`)
    }

    get name() { return this._name }
    get src() { return this._src }
    get target() { return this._target }
    get enablePlayback() { return this._enablePlayback }
    get renameDoneFile() { return this._renameDoneFile }
    get isRecording() { return this._isRecording }
    get isPreparing() { return this._isPreparing }
    get startTime() { return this._startTime }
    get createTime() { return this._createTime }
    get bytesRecorded() { return this._bytesRecorded }
    get duration() { return this._durationRecorded }
    get rStream() { return this._rStream }
    get wStream() { return this._wStream }
    get localm3u8() { return this._localm3u8 }
    get command() { return this._command }
    get killTimer() { return this._killTimer }
    get exitByTimeout() { return this._exitByTimeout}
    get elapsed() { 
        const elapsedMS = Date.now() - this.startTime;
        return elapsedMS > 0 ? elapsedMS : 0;
    }
    get isBusy() { 
        return this.isRecording || this.isPreparing 
    }  
    set src(url) { 
        if(this.isBusy) throw new Error("because recorder is busy, can't change");
        this._src = url;
    }
    set target(target) { 
        if(this.isBusy) throw new Error("because recorder is busy, can't change");
        this._target = target;
    }   
    set command(cmd) { this._command = cmd }
    set isRecording(bool) { this._isRecording = bool }
    set isPreparing(bool) { this._isPreparing = bool }
    set startTime(date) { this._startTime = date }
    set createTime(date) { this._createTime = date }
    set rStream(stream) { this._rStream = stream }
    set wStream(stream) { this._wStream = stream }
    set localm3u8(m3u8) { this._localm3u8 = m3u8 }
    set bytesRecorded(bytes) { this._bytesRecorded = bytes }
    set duration(duration) { 
        this._durationRecorded = duration;
        this.emit('progress', {
            bytes: this.bytesRecorded,
            duration: this.duration
        })
    };
    set killTimer(timer) { this._killTimer = timer}
    set exitByTimeout(bool) { this._exitByTimeout = bool}

    onFFMPEGEnd = (error) => {
        this.log.info(`ffmpeg ends! : ${this.target} ${this.localm3u8}`);
        clearTimeout(this.killTimer);
        if(error && !this.exitByTimeout){
            this.log.error(`ended abnormally: startime = ${this.startTime}: duration=${this.duration}`);
            this.emit('error', this.target, this.startTime, this.duration, error);
            this.initialize();            
            return
        }
        if(this.exitByTimeout){
            this.log.error(`ended by timeout!`)
        }
        this.log.info(`ended: startime = ${this.startTime}: duration=${this.duration}`)
        this.emit('end', this.target, this.startTime, this.duration)
        this.initialize();
    }
    onReadStreamClosed = () => {
        this.log.info(`read stream closed : ${this.src}`);
    }
    startHandler = cmd => {
        this.log.info(`started: ${cmd}`);
        this.isPreparing = false;
        this.isRecording = true;
        this.startTime = Date.now();
        this.emit('start', cmd);
    }
    progressHandler = event => {
        this.duration = event.timemark;
        this.log.debug(`duration: ${this.duration}, successive_event_limit: ${this.CRITICAL_SUCCESSIVE_OCCUR_COUNT}`);
        // const CRITICAL_SUCCESSIVE_OCCUR_COUNT = 5;
        const durationNotChanged = this.checkSuccessiveEvent(this.duration, this.CRITICAL_SUCCESSIVE_OCCUR_COUNT);
        this.log.debug(`value of durationNotChanged: ${durationNotChanged}, duration=${this.duration}`);
        if(durationNotChanged){
            this.log.error(`duration not changed last ${this.CRITICAL_SUCCESSIVE_OCCUR_COUNT} times`)
            this.log.error(`kill ffmpeg`)
            this.command.kill();
        }
    }

    start = () => {
        if(this.isBusy) {
            this.log.warn('already started!. stop first');
            throw new Error('already started!. stop first')
        }
        this.isPreparing = true;
        this.log.info(`start encoding.... ${this.src}`);
        try {
            this.command = ffmpeg(this._src).inputOptions(hlsInputOptions).output(this._localm3u8).outputOptions(hlsOptions);
        } catch (error) {
            this.log.error(error.message)
        }
        const startTimestamp = Date.now();
        this.command
        .on('start', this.startHandler)
        .on('progress', this.progressHandler)
        .on('stderr', stderrLine => {
            this.log.debug(`${stderrLine}`);
        })
        .on('error', error => {
            this.log.error(`ffmpeg error: ${error.message}`) ;
            this.onFFMPEGEnd(error);
        })
        .on('end', (stdout, stderr) => {
            const [currentOccurence, tooOften] = this._tooOftenEnded();
            this.log.info(`ffmpeg ends. currentOccurence=[${currentOccurence}] tooOften=[${tooOften}]`);
            if(tooOften){
                this.log.error(`ffmpeg ends too often[${currentOccurence}]. recording will continue in next schedule.`);

                // if recording ends too frequently(ex: over 5 times in 5 minutes),
                // emit normal stop => wait next schedule.
                // To prevent status change problem(remaining "started"), emit end event after 20 seconds later
                setTimeout(() => {
                    this.onFFMPEGEnd()
                }, 20000)
                return;
            }
            const elapsed = Date.now() - startTimestamp;
            if(elapsed < this._tooFastEndMs){
                // if too frequenctly end, emit normal ffmpeg end => wait next schedule.
                // otherwise emit abnoraml ffmpeg end. => immediate re-start.
                this.log.error(`ffmpeg end too early[in ${this._tooFastEndMs}ms]. end event will be emitted in 20 seconds`);
                const error ='END_TOO_EARLY';
                setTimeout(() => {
                    this.onFFMPEGEnd(error)
                }, 20000)
            } else {
                // recorded enough time
                this.onFFMPEGEnd();
            }
        })
        .run();
    }

    stop = () => {
        if(!this.isRecording){
            this.log.warn(`start recording first!. there may be premature ending of ffmpeg.`)
            this.emit('end', this.target, this.startTime, this.duration)
            this.initialize();
            // throw new Error('start recording first!.')  
            // "throw new Error" comment, because ffmpeg ended already case can be occurred and can make some trouble.
            // if that case happened, manual(or scheduled) stop can't be processed forever if throws error, 
            // because isRecording is already false...
            // initialization already processed, don't need do something. just return;
            return;
        }
        this.log.info(`stopping ffmpeg...`);
        // const ffmpegProcId = this.command.ffmpegProc.pid;
        this.command.ffmpegProc.stdin.write('q', () =>{
            this.log.info(`write quit to ffmpeg's stdin done!`);
            this.killTimer = setTimeout(() => {
               this.log.info(`stopping ffmpeg takes too long. force stop!`);
               this.exitByTimeout = true;
               this.command.kill();
            }, FFMPEG_QUIT_TIMEOUT)
        })
    }
    destroy = () => {
        this.command && this.command.kill();
    }
}

const createHLSRecoder = options => {
    const {
        name= 'channel1',
        src= url,
        target='d:/temp/cctv_kbs_ffmpeg.mp4', 
        enablePlayack= true, 
        localm3u8= 'd:/temp/cctv/stream.m3u8',
        ffmpegBinary= 'd:/temp/cctv/ffmpeg.exe',
        renameDoneFile= false,
        successive_duration_limit= 5,
        tooOftenEnded=()=>{return [9999, false]}
    } = options;
    log.info(`create HLS Recorder!`);
    return new RecoderHLS(options);
}

const convertMP4 = (inFile, outFile, ffmpegPath) => {
    ffmpeg.setFfmpegPath(ffmpegPath);
    return new Promise((resolve, reject) => {
        const command = 
            ffmpeg(inFile)
            .outputOptions(['-c','copy']) 
            .output(outFile)
            .on('progress', progress => console.log(progress))
            .on('start', cmd => console.log('started: ',cmd))
            .on('error', error => {
                console.log(error);
                reject(error)
            })
            .on('end', (stdout, stderr) => {
                const regExp = new RegExp(/Duration: (\d\d:\d\d:\d\d.\d\d), start:/)
                const duration = regExp.exec(stderr)[1];
                resolve(duration)
            })
        command.run();
    })
}

export default {
    createHLSRecoder,
    convertMP4
};












