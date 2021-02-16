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
import log from 'electron-log';

import HLSRecorder from '../../../lib/RecordHLS_ffmpeg';
import {getAbsolutePath} from '../../../lib/electronUtil';

import { makeStyles } from '@material-ui/core/styles';
const useStyles = makeStyles((theme) => ({
    customWidth: {
      maxWidth: 500,
    }
}));

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

const Controls = props => {
    const [tooltipOpen, setTooltipOpen] = React.useState(false);
    const {channelNumber, source, bgColors} = props;
    const {
        channelName="channelX",
        duration="00:00:00.00",
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
        setDuration=()=>{},
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

    const refreshChannelPlayer = (event) => {
        refreshPlayer({channelNumber});
    }

    const remountChannelPlayer = (event) => {
        remountPlayer({channelNumber});
    }

    const toggleMountPlayer = React.useCallback( event => {
        setPlayerMount({channelNumber, mountPlayer:!mountPlayer})
    }, [mountPlayer]);


    const dismountRecorder = (event) => {
        setRecorderMount({channelNumber, mountRecorder:false});
    }

    const startRecordChannel = event => {
        startRecording(channelNumber);
    }

    const stopRecordChannel = event => {
        stopRecording(channelNumber);
    }

    const stopRecordChannelForce = event => {
        stopRecordingForce(channelNumber);
    }

    const startScheduleChannel = event => {
        startSchedule(channelNumber);
    }

    const stopScheduleChannel = event => {
        stopSchedule(channelNumber);
    }

    const handleTooltipClose = () => {
        setTooltipOpen(false)
    }

    const showStatistics = () => {
        setTooltipOpen(previous => {
            return !previous;
        })
    }

    const {remote} = require('electron');
    const openDirectory = () => {
        remote.shell.openPath(channelDirectory)
    }

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
      
    const classes = useStyles();
    
    return (
        <Box display="flex" flexDirection="column" mr="3px">
            <Tooltip
                title={"Refresh Player"}
                placement="right"
                disableFocusListener 
                disableTouchListener 
                arrow
            >
                <SmallPaddingIconButton 
                    disabled={!mountPlayer} 
                    onClick={refreshChannelPlayer} 
                    padding="1px" 
                    size="small" 
                    iconcolor="black"
                >
                    <RefreshIcon color="primary" fontSize={"small"}></RefreshIcon>
                </SmallPaddingIconButton>
            </Tooltip>
            <Tooltip
                title={mountPlayer ? "playback off" : "playback on"}
                placement="right"
                disableFocusListener 
                disableTouchListener 
                arrow
            >
                <SmallPaddingIconButton 
                    padding="1px" 
                    size="small" 
                    iconcolor="black"
                    onClick={toggleMountPlayer}
                >
                    {mountPlayer ? 
                        <TvOffIcon fontSize={"small"} ></TvOffIcon> :
                        <TvIcon fontSize={"small"} ></TvIcon>
                    }
                </SmallPaddingIconButton>
            </Tooltip>
            <SmallPaddingIconButton disabled={inTransition} padding="1px" size="small" iconcolor={recorderIconColor}>
                <FiberManualRecordIcon 
                    fontSize={"small"} 
                    onClick={recorderStatus==="started" ? stopRecordChannel : startRecordChannel}
                ></FiberManualRecordIcon>
            </SmallPaddingIconButton>
            <SmallPaddingIconButton disabled={inTransition} padding="1px" size="small" iconcolor={scheduleIconColor}>
                <AccessAlarmIcon 
                    fontSize={"small"} 
                    onClick={scheduleStatus==="started" ? stopScheduleChannel : startScheduleChannel}
                ></AccessAlarmIcon>
            </SmallPaddingIconButton>
            <Box mt="auto" display="flex" flexDirection="column">
                <StyledBadge 
                    badgeContent={<Box>{channelStat.clipCountFolder}</Box>} 
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
                    <Tooltip
                        open={tooltipOpen}
                        title={<AppStatComponent></AppStatComponent>}
                        classes={{ tooltip: classes.customWidth }}
                        placement="left"
                        arrow
                    >
                    <SmallPaddingIconButton 
                        padding="1px" 
                        size="small" 
                        iconcolor="black"
                        onClick={showStatistics}
                    >
                        <AssignmentIcon 
                            fontSize={"small"} 
                        ></AssignmentIcon>
                    </SmallPaddingIconButton>
                    </Tooltip>
                </ClickAwayListener>
                <Tooltip
                        title={"force stop recording"}
                        placement="right"
                        disableFocusListener 
                        disableTouchListener 
                        arrow
                    >
                    <SmallPaddingIconButton 
                        padding="1px" 
                        size="small" 
                        iconcolor="black"
                        onClick={stopRecordChannelForce}
                    >
                        <PowerSettingsNewIcon 
                            fontSize={"small"} 
                        ></PowerSettingsNewIcon>
                    </SmallPaddingIconButton>
                </Tooltip>
            </Box>
        </Box>
    );
};

export default React.memo(Controls);