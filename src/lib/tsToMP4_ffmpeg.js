const fs = require('fs');
var ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath("d:/temp/cctv/ffmpeg.exe");
ffmpeg.setFfprobePath("d:/temp/cctv/ffprobe.exe");


const tsFile = 'c:/temp/all_Long.ts'
const outFile = 'c:/temp/all_Long.mp4'
const command = ffmpeg(tsFile)
                .outputOptions(['-c','copy']) // seek works, but duration incorrect(too short)
                .output(outFile)
                .on('progress', progress => console.log(progress))
                .on('start', cmd => console.log('started: ',cmd))
            //   .on('stderr', error => console.log(error)) 
                .on('error', error => console.log(error))
                .on('end', (stdout, stderr) => {
                    // console.log(stderr)
                    // ffmpeg.ffprobe(outFile, (err, metadata) => console.log(metadata))
                    const regExp = new RegExp(/Duration: \d\d:\d\d:\d\d.\d\d/)
                    console.log(regExp.exec(stderr)[0])
                })

command.run();