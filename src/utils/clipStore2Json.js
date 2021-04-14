const CLIPSTORE_FILE = './clipStore_0414.json'
const storeJson = require(CLIPSTORE_FILE);
const durationToSeconds = durationString => {
    const [hours, minutes, secondsWithFrame] = durationString.split(':');
    const [seconds, frames] = secondsWithFrame.split('.');
    return parseInt(hours * 60 * 60) + parseInt(minutes * 60) + parseInt(seconds);
}

for(const clipId in storeJson){
    const {
        startTime, endTime,
        startTimestamp, endTimestamp,
        title,
        duration
    } = storeJson[clipId];
    const durationFromTime = ((endTimestamp - startTimestamp)/1000).toFixed(0)
    const durationSeconds = durationToSeconds(duration);
    const diffTimeNDuration = durationSeconds - durationFromTime;
    console.log(`${startTime}^${endTime}^${title}^${startTimestamp}^${endTimestamp}^${durationFromTime}^${duration}^${durationSeconds}^${diffTimeNDuration}`)
}
