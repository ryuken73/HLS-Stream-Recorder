import React from 'react';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import SectionWithFullHeight from '../template/SectionWithFullHeight';
import DurationContainer from '../../containers/DurationContainer';
import SourceSelectorContainer from '../../containers/SourceSelectorContainer';
import HLSPlayerContainer from '../../containers/HLSPlayerContainer';
import ControlsContainer from '../../containers/ControlsContainer';
import SchedulerContainer from '../../containers/SchedulerContainer';
import SourceRecordingContainer from '../../containers/SourceRecordingContainer';
import { setRecorder, setRecorderMount } from '../../modules/hlsRecorders';

const HLSRecorder = (props) => {
    const {
        channelNumber=1, 
        recorderStatus="stopped",
        store,
        mountRecorder=true
    } = props;

    const {setRecorderMount} = props.HLSRecorderActions;

    const bgColors = {
        // 'starting': 'maroon',
        'starting': '#540101',
        'started': 'maroon',
        'stopping': '#540101',
        'stopped': 'black'
    }

    const bgColor = bgColors[recorderStatus];
    const hideSourceSelect = recorderStatus === "stopped" ? false : true;

    const remountRecorder = event => {
        setRecorderMount({channelNumber, mountRecorder:true});
    }

    return (
        <Box>
        { mountRecorder ?
            <SectionWithFullHeight m={"5px"} flexGrow={0} width="320px" bgcolor={"#2d2f3b"} border={1} borderColor={"black"} p="1px">
                <DurationContainer 
                    channelNumber={channelNumber}
                    bgColors={bgColors}
                ></DurationContainer>
                <SourceRecordingContainer
                    channelNumber={channelNumber}
                    hidden={!hideSourceSelect}
                ></SourceRecordingContainer>
                <SourceSelectorContainer 
                    hidden={hideSourceSelect}
                    channelNumber={channelNumber}
                ></SourceSelectorContainer>
                <Box display="flex" alignItems="stretch">
                    <ControlsContainer
                        channelNumber={channelNumber}
                        bgColors={bgColors}
                    ></ControlsContainer>
                    <Box border={2} borderColor={bgColor}>
                        <HLSPlayerContainer 
                            channelNumber={channelNumber}
                        ></HLSPlayerContainer>
                    </Box>
                </Box>
                <SchedulerContainer
                    channelNumber={channelNumber}
                ></SchedulerContainer>
            </SectionWithFullHeight>
            : 
            <SectionWithFullHeight m={"5px"} flexGrow={0} width="320px" bgcolor={"#2d2f3b"} border={1} borderColor={"black"} p="1px">
                <Box>Preparing...</Box>
                <Button onClick={remountRecorder}>Mount</Button>
            </SectionWithFullHeight>
        }
        </Box>

    );
};

export default React.memo(HLSRecorder);