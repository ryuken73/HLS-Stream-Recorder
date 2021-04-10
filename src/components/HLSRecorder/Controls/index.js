import React from 'react';
import Box from '@material-ui/core/Box';
import RefreshIcon from '@material-ui/icons/Refresh';
import AccessAlarmIcon from '@material-ui/icons/AccessAlarm';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import TvIcon from '@material-ui/icons/Tv';
import TvOffIcon from '@material-ui/icons/TvOff';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import AssignmentIcon from '@material-ui/icons/Assignment';
import Tooltip from '@material-ui/core/Tooltip';
import Badge from '@material-ui/core/Badge';
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew';
import { withStyles } from '@material-ui/core/styles';
import {SmallPaddingIconButton}  from '../../template/smallComponents';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import BorderedList from '../../template/BorderedList';
import SmallIconWithTooltip from './SmallIconWithTooltip';
import ScheduleButton from './ScheduleButton';
import RecordButton from './RecordButton';
import log from 'electron-log';

import HLSRecorder from '../../../lib/RecordHLS_ffmpeg';
import {getAbsolutePath} from '../../../lib/electronUtil';

// import { makeStyles } from '@material-ui/core/styles';
// const useStyles = makeStyles((theme) => ({
//     customWidth: {
//       maxWidth: 500,
//     }
// }));

const rimraf = require('rimraf');
const path = require('path');
import {file} from '../../../utils';
import { setRecorderMount } from '../../../modules/hlsRecorders';

async function mkdir(directory){
    try {
        await file.makeDirectory(directory);
    } catch (err) {
        console.error('in HLSRecorder index.js');
        console.error(err);
    }
}

const StyledBadge = withStyles((theme) => ({
    badge: {
      right: -10,
      top: -8,
      border: `1.5px solid ${theme.palette.background.paper}`,
      padding: '0 4px',
      fontSize: '12px',
      background: 'darkslategrey'
    },
}))(Badge);

// const SmallIconWithTooltip = (props) => {
//     const {title, onclick, disabled=false, tooltipClass, open, children} = props;
//     return (
//         <Tooltip
//             title={title}
//             placement="right"
//             open={open}
//             classes={tooltipClass}
//             disableFocusListener 
//             disableTouchListener 
//             arrow
//         >
//             <SmallPaddingIconButton 
//                 padding="1px" 
//                 size="small" 
//                 iconcolor="black"
//                 onClick={onclick}
//                 disabled={disabled}
//             >
//                 {children}
//             </SmallPaddingIconButton>
//         </Tooltip>
//     )
// }


const Controls = props => {
    const [tooltipOpen, setTooltipOpen] = React.useState(false);
    const {channelNumber, source, bgColors} = props;
    const {
        channelName="channelX",
        // duration="00:00:00.00",
        channelDirectory="c:/cctv/channelX",
        url="",
        recorder=null,
        inTransition=false,
        scheduleFunction=null,
        autoStartSchedule=true,
        localm3u8=null,
        recorderStatus='stopped',
        scheduleStatus='stopped',
        mountPlayer=true
    } = props

    const recorderIconColor = bgColors[recorderStatus];
    const scheduleIconColor = bgColors[scheduleStatus];
    
    const {
        refreshPlayer=()=>{},
        remountPlayer=()=>{},
        setPlayerMount=()=>{}
    } = props.HLSPlayerActions;

    const {
        // setDuration=()=>{},
        setRecorder=()=>{},
        setRecorderStatus=()=>{},
        setRecorderInTransition=()=>{},
        setScheduleFunction=()=>{},
        setScheduleStatus=()=>{},
        setAutoStartSchedule=()=>{},
        startRecording=()=>{},
        stopRecording=()=>{},
        refreshRecorder=()=>{},
        setRecorderMount=()=>{},
        startSchedule=()=>{},
        stopSchedule=()=>{},
        restartRecording=()=>{},
        createRecorder=()=>{},
        stopRecordingForce=()=>{}
    } = props.HLSRecorderActions; 

    const createLogger = channelName => {
        return {
            info: msg => {log.info(`[${channelName}][ChannelControl]${msg}`)},
            error: msg => {log.error(`[${channelName}][ChannelControl]${msg}`)}
        }
    }
    const channelLog = createLogger(channelName);
    React.useEffect(() => {
        try {
            mkdir(channelDirectory);
        } catch (err) {
            return
        }
    },[])

    React.useEffect(() => {
        createRecorder(channelNumber);
    },[])

    const refreshChannelPlayer = React.useCallback((event) => {
        refreshPlayer({channelNumber});
    },[channelNumber]);

    const remountChannelPlayer = React.useCallback((event) => {
        remountPlayer({channelNumber});
    },[channelNumber]);

    const toggleMountPlayer = React.useCallback( event => {
        setPlayerMount({channelNumber, mountPlayer:!mountPlayer})
    }, [channelNumber, mountPlayer]);


    const dismountRecorder = React.useCallback((event) => {
        setRecorderMount({channelNumber, mountRecorder:false});
    }, [channelNumber]);

    const startRecordChannel = React.useCallback(event => {
        startRecording(channelNumber);
    }, [channelNumber]);

    const stopRecordChannel = React.useCallback(event => {
        stopRecording(channelNumber);
    }, [channelNumber]);

    const stopRecordChannelForce = React.useCallback(event => {
        stopRecordingForce(channelNumber);
    }, [channelNumber])

    const startScheduleChannel = React.useCallback(event => {
        startSchedule(channelNumber);
    }, [channelNumber]);

    const stopScheduleChannel = React.useCallback(event => {
        stopSchedule(channelNumber);
    }, [channelNumber])

    const handleTooltipClose = React.useCallback(() => {
        setTooltipOpen(false)
    },[])

    const showStatistics = React.useCallback(() => {
        setTooltipOpen(previous => {
            return !previous;
        })
    },[])

    const {remote} = require('electron');
    const openDirectory = React.useCallback(() => {
        remote.shell.openPath(channelDirectory)
    },[]);

    const {channelStat={}} = props;
    const {
        clearChannelStatNStore=()=>{},
        refreshChannelClipCountStatistics=()=>{}
    } = props.StatisticsActions;
    const initializeChannelStatNStore = clearChannelStatNStore;
    React.useEffect(() => {
        if(Object.entries(channelStat).length === 0){
            initializeChannelStatNStore({channelNumber});
        }
        refreshChannelClipCountStatistics({channelNumber});
    },[])

    const AppStatComponent = () => {
        const StatLists = Object.entries(channelStat).map(([statName, value]) => {
            if(statName.includes('Time')){                
                if(value === null) {
                    value = '-';                    
                } else {
                    value = (new Date(value)).toLocaleString();
                }
            }
            return <BorderedList
                color={"white"}
                bgcolor={"#232738"}
                titlewidth={"80px"}
                subject={statName}
                content={value}
            ></BorderedList>
        })
        return StatLists;
    }

    // const StyledBadge = withStyles((theme) => ({
    //     badge: {
    //       right: -10,
    //       top: -8,
    //       border: `1.5px solid ${theme.palette.background.paper}`,
    //       padding: '0 4px',
    //       fontSize: '12px',
    //       background: 'darkslategrey'
    //     },
    // }))(Badge);
      
    // const classes = useStyles();

    // const onClickScheduleButton = React.useCallback( event => {
    //     console.log('click schedule')
    //     return scheduleStatus==="started" ? stopScheduleChannel() : startScheduleChannel();
    // },[scheduleStatus, stopScheduleChannel, startScheduleChannel])

    // const onClickRecordButton = React.useCallback(() => {
    //     return recorderStatus==="started" ? stopRecordChannel : startRecordChannel
    // },[recorderStatus, stopRecordChannel, startRecordChannel])

    const BatchContentComponent = React.memo(() => {
        return <Box>{channelStat.clipCountFolder}</Box>
    },[channelStat.clipCountFolder])
        
    return (
        <Box display="flex" flexDirection="column" mr="3px">
            <ScheduleButton
                disabled={inTransition}
                iconcolor={scheduleIconColor}
                onClickScheduleButton={scheduleStatus === 'started' ? stopScheduleChannel:startScheduleChannel}
            ></ScheduleButton>
            <RecordButton
                disabled={inTransition}
                iconcolor={recorderIconColor}
                onClickRecordButton={recorderStatus === "started" ? stopRecordChannel : startRecordChannel}
            ></RecordButton>
            <Box mt="auto" display="flex" flexDirection="column">
                <SmallIconWithTooltip
                    title={"force stop recording"}
                    onclick={stopRecordChannelForce}
                >
                    <PowerSettingsNewIcon fontSize={"small"}></PowerSettingsNewIcon>
                </SmallIconWithTooltip>
                <SmallIconWithTooltip
                    title={"Refresh Player"}
                    onclick={refreshChannelPlayer}
                    disabled={!mountPlayer}
                >
                    <RefreshIcon fontSize={"small"}></RefreshIcon>
                </SmallIconWithTooltip>
                <SmallIconWithTooltip
                    title={mountPlayer ? "playback off" : "playback on"}
                    onclick={toggleMountPlayer}
                >
                    {mountPlayer ? 
                        <TvOffIcon fontSize={"small"} ></TvOffIcon> :
                        <TvIcon fontSize={"small"} ></TvIcon>
                    }
                </SmallIconWithTooltip>
                <StyledBadge 
                    // badgeContent={<Box>{channelStat.clipCountFolder}</Box>} 
                    badgeContent={<BatchContentComponent></BatchContentComponent>}
                    color="primary"
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                >
                    <SmallPaddingIconButton padding="1px" size="small" iconcolor="black">
                        <FolderOpenIcon 
                            fontSize={"small"} 
                            onClick={openDirectory}
                        ></FolderOpenIcon>
                    </SmallPaddingIconButton>
                </StyledBadge>
                <ClickAwayListener onClickAway={handleTooltipClose}>
                    <SmallIconWithTooltip
                        title={<AppStatComponent></AppStatComponent>}
                        onclick={showStatistics}
                        open={tooltipOpen}
                        // classes={{ tooltip: classes.customWidth }}

                    >
                        <AssignmentIcon fontSize={"small"}></AssignmentIcon>
                    </SmallIconWithTooltip>
                </ClickAwayListener>
            </Box>
        </Box>
    );
};

export default React.memo(Controls);