const {getCombinedConfig} = require('./getConfig');
const config = getCombinedConfig({storeName:'optionStore', electronPath:'home'});

const {
    KAFKA_TOPIC=`topic_${Date.now()}`, 
    KAFKA_KEY='none'
} = config;

import {kafka} from './kafkaSender';
import { sendMessage } from './kafkaClient';
const kafkaSender = kafka({topic:KAFKA_TOPIC});

export const sendAppMessage = statusReport => {
    statusReport.type = 'appStatistics';
    statusReport.source = 'app';
    kafkaSender.send({
        key: KAFKA_KEY,
        messageJson: statusReport
    })
}

export const sendChannelMessage = (channelNumber, statusReport) => {
    statusReport.type = 'channelStatistics';
    statusReport.source = `channel${channelNumber}`;
    statusReport.channelNumber = channelNumber;
    kafkaSender.send({
        key: KAFKA_KEY,
        messageJson: statusReport
    })
}