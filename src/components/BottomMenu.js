import React from 'react';
import Box from '@material-ui/core/Box';
import {SmallButton}  from './template/smallComponents';

import BorderedBox from './template/BorderedBox';
import IconButton from '@material-ui/core/IconButton';
import SettingsIcon from '@material-ui/icons/Settings';
import { Typography } from '@material-ui/core';
import OptionSelect from './template/OptionSelect';

const buttonColor = 'darkslategrey';

const ButtomMenu = (props) => {
    const {mt="auto"} = props;
    const {
        scheduleStatusAllStop:scheduleStatusAllStopped,
        recorderStatusAllStop:recorderStatusAllStopped,
        scheduleStatusAllSame,
        recorderStatusAllSame,
        recorderStatusAnyInTransition,
        intervalsForSelection,
    } = props;
    const {
        startScheduleAll=()=>{},
        stopScheduleAll=()=>{},
        startRecordAll=()=>{},
        stopRecordAll=()=>{},
        changeAllIntervals=()=>{}
    } = props.HLSRecorderActions;
    console.log('$$$$$$$$', changeAllIntervals)
    const scheduleButtonColor =  scheduleStatusAllStopped ? 'darkslategrey' : 'maroon';
    const recordButtonColor =  recorderStatusAllStopped ? 'darkslategrey' : 'maroon';

    return (      
        <Box 
            display="flex" 
            // alignItems="center"
            mx="5px"
            mt={mt}
            // alignContent="center"
        >
            <Box 
                display="flex" 
                my="5px"
                alignContent="center"
            >
                <Box mx="10px">
                    <Typography>
                        Apply All
                    </Typography>
                </Box>
                <SmallButton 
                    size="small" 
                    color="secondary" 
                    variant={"contained"} 
                    mt={"0px"}
                    mb={"0px"}
                    ml={"10px"}
                    mr={"0px"}
                    bgcolor={scheduleButtonColor}
                    minwidth={"130px"}
                    disabled={recorderStatusAnyInTransition || !scheduleStatusAllSame
                    }
                    onClick={scheduleStatusAllStopped ? startScheduleAll : stopScheduleAll}
                >{scheduleStatusAllStopped ? "start schedule" : "stop schedule"}</SmallButton>
                <SmallButton 
                    size="small" 
                    color="secondary" 
                    variant={"contained"} 
                    mt={"0px"}
                    mb={"0px"}
                    ml={"5px"}
                    mr={"0px"}
                    bgcolor={recordButtonColor}
                    minwidth={"130px"}
                    disabled={recorderStatusAnyInTransition || !recorderStatusAllSame}
                    onClick={recorderStatusAllStopped ? startRecordAll : stopRecordAll}
                >{recorderStatusAllStopped ? "start record" : "stop record"}
                </SmallButton>
                <Box
                    mt={"0px"}
                    mb={"0px"}
                    ml={"5px"}
                    mr={"0px"}
                >
                    <OptionSelect
                        selectColor={"darkslategrey"}
                        disabled={!scheduleStatusAllStopped || recorderStatusAnyInTransition}
                        intervalsForSelection={intervalsForSelection}
                        minWidth="150px"
                        onChangeSelect={changeAllIntervals}
                    ></OptionSelect>
                </Box>
            </Box>
        </Box>  

    );
};

export default React.memo(ButtomMenu);