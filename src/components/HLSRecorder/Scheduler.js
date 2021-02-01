import React from 'react';
import OptionSelectButton from '../template/OptionSelectButton';
import ScheduleButton from './ScheduleButton';
import log from 'electron-log';

const DEFAULT_INTERVALS = [
    {title: '1 Minute', milliseconds: 60000}
]

function IntervalSelection(props) {
    const {
        channelNumber=1,
        scheduleInterval=60000, 
        recorderStatus="stopped"
    } = props;
    const {
        inTransition=false, 
        scheduleStatus="stopped", 
        scheduledFunction=()=>{},
        intervalsForSelection=DEFAULT_INTERVALS
    } = props;
    const {
        startSchedule=()=>{}, 
        stopSchedule=()=>{},
        setScheduleIntervalNSave=()=>{}
    } = props.HLSRecorderActions;

    const inRecording = recorderStatus !== 'stopped';
    const selectItems = intervalsForSelection.map(interval => {
        return {
            value: interval.milliseconds,
            label: interval.title
        }
    })

    const onChangeSelect = (event) => {
        setScheduleIntervalNSave({channelNumber, scheduleInterval:event.target.value})
    }

    const ButtonElement = () => {
        return <ScheduleButton
                    channelNumber={channelNumber}
                    inTransition={inTransition}
                    scheduleStatus={scheduleStatus} 
                    scheduledFunction={scheduledFunction}
                    startSchedule={startSchedule}
                    stopSchedule={stopSchedule}
                >
                </ScheduleButton>
    } 

    return (
        <OptionSelectButton 
            FrontButton={ButtonElement}
            currentItem={scheduleInterval}
            multiple={false}
            menuItems={selectItems}
            onChangeSelect={onChangeSelect} 
            smallComponent={true}
            bgcolor={'#232738'}
            selectColor={"#2d2f3b"}
            disabled={inRecording}
            mb={"2px"}
            mt={"4px"}
        ></OptionSelectButton>
    )
}

export default  React.memo(IntervalSelection)