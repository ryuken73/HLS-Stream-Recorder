const cron = require('node-cron');
const EventEmitter = require('events');

export const scheduler = (enabled=true, logger) => {

    const registeredTasks = new Map();

    const register = (name, schedule) => { 
        const scheduleEvent = new EventEmitter();
        const valid = cron.validate(schedule);
        if(!valid){
            logger.error(`Not valid cron string (syntax: SS(0-59) MM(0-59) HH(0-23) DD(1-31) MO(1-12) W(0-7) : ${schedule}`);
            return false; 
        }
        const task = cron.schedule(schedule, () => scheduleEvent.emit(`triggered`, name), {
            scheduled: false,
            timezone: "Asia/Seoul"
        });
        registeredTasks.set(name, task);   
        scheduleEvent.start = () => {
            logger.info(`scheduler ${name} started!`);
            task.start();
        }
        scheduleEvent.stop = () => {
            logger.info(`scheduler ${name} stopped!`);
            task.stop();
        }

        return scheduleEvent; 
    }

    const unregister = (name) => {
        if(!registeredTasks.has(name)) {
            return false;
        } 
        registeredTasks.delete(name);
        return true
    }
    
    const start = scheduleName => {
        if(registeredTasks.has(scheduleName)){
            registeredTasks.get(scheduleName).start();
            logger.info(`scheduler ${scheduleName} started!`);
            return true;
        } else {
            logger.error(`No such task. register first! : ${scheduleName}`);
            return false;
        }
    }
    
    const stop = scheduleName => {
        if(registeredTasks.has(scheduleName)){
            registeredTasks.get(scheduleName).stop();
            logger.info('scheduler stopped!');
            return true;
        } else {
            logger.error(`No such task. register first! : ${scheduleName}`);
            return false;
        }
    }

    if(enabled){
        return {
            register,
            unregister,
            start,
            stop
        }
    }

    const dummyFunction = () => {};

    return {
        register: dummyFunction,
        unregister: dummyFunction,
        start: dummyFunction,
        stop: dummyFunction,
    }

}

