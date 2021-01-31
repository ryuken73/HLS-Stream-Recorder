const {createProducer, sendMessage} = require('./kafkaClient');
const {
    KAFKA_CLIENT_ID='default_client',
    KAFKA_BROKERS=[],
    KAFKA_ENABLED=false
} = require('./getConfig').getCombinedConfig()

class KafkaSender {
    constructor({topic=`topic_${Date.now()}`}){
        this.topic = topic;
        this.producer = createProducer({
            clientId: KAFKA_CLIENT_ID,
            brokers: KAFKA_BROKERS
        });
    }

    send = async ({key='none', messageJson={}}) => {
        console.log(`@@ kafkaSender send called : ${messageJson}`);
        try {
            const {type, source, name, value} = messageJson;
            console.log(`@@ notify report : type[${type}] source[${source}] name[${name}] value[${value}]`);
            const payloads = {
                topic: this.topic,
                messages: [{
                    key,
                    value:JSON.stringify(messageJson)
                }]
            }
            const result = await sendMessage(this.producer, payloads);
            console.log('###', result)
            this.producer.disconnect();
        } catch (err) {
            console.error(err);
        }

    }
}

export const kafka = topic => {
    const kafkaClient = new KafkaSender(topic);
    if(KAFKA_ENABLED === false){
        return { send: () => {} }
    }
    const client = {
        send: async (params) => {
            return await kafkaClient.send(params)
        }
    }
    return client;
}