const {Kafka} = require('kafkajs');

export const createProducer = (options) => {
        try {
            const {clientId, brokers} = options;
            const kafka = new Kafka({clientId, brokers});
            const producer = kafka.producer();
            return producer;

        } catch (err) {
            console.error(err);
            return false;
        }
}

export const sendMessage = async (producer, payloads) => {
    try {
        await producer.connect();
        return producer.send(payloads); //producer.send returns promise
    } catch(err) {
        producer.disconnect();
        console.error(err);
    }
}

// export default {
//     createProducer,
//     sendMessage
// }

/*
const brokers = ['nodesr01:9092','nodesr02:9092','nodesr03:9092'];
const clientId = 'node_kafkajs_client';
const testProducer = async () => {
    try {
        const producer = createProducer({clientId, brokers});
        const payloads = {topic:'dns-health', messages:[{key:'key1',value:'node-kafka test ryuken'},{key:'key1',value:'node-kafka test ryuken1'}]};
        const result = await sendMessage(producer, payloads);
        producer.disconnect()
        console.log(result);
    } catch (err) {
        console.error(err);
        producer.disconnect()
    }
}

(async() => {
    await testProducer();
})();
*/