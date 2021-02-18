import React, {useEffect, useState} from 'react';
import Box from '@material-ui/core/Box'
import BorderedList from './template/BorderedList';
import RefreshIcon from '@material-ui/icons/Refresh';
import SettingsIcon from '@material-ui/icons/Settings';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import AccessAlarmIcon from '@material-ui/icons/AccessAlarm';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import TvIcon from '@material-ui/icons/Tv';
import TvOffIcon from '@material-ui/icons/TvOff';
import HomeIcon from '@material-ui/icons/Home';
import BugReportIcon from '@material-ui/icons/BugReport';
import AssignmentIcon from '@material-ui/icons/Assignment';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import LiveHelpIcon from '@material-ui/icons/LiveHelp';
import BackspaceIcon from '@material-ui/icons/Backspace';
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew';
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';
import OptionSelect from './template/OptionSelect';
import Tooltip from '@material-ui/core/Tooltip';
import {BasicIconButton, BasicIconButtonWithTooltip} from './template/basicComponents';
import {webFrame} from 'electron';
import {ipcRenderer} from 'electron';
import {remote} from 'electron';

import { makeStyles } from '@material-ui/core/styles';
const useStyles = makeStyles((theme) => ({
    customWidth: {
      maxWidth: 500,
    }
}));

const Header = (props) => {
    // console.log('$$$$', props)
    const {setConfirmOpen=()=>{}, setConfirmAction=()=>{}} = props;
    const {setConfirmDialogTitle=()=>{}, setConfirmDialogText=()=>{}} = props;
    const {BASE_DIRECTORY="c:/temp"} =  props.config;
    const [tooltipOpen, setTooltipOpen] = React.useState(false);

    const {openOptionsDialog} = props.OptionDialogActions;

    const {
        scheduleStatusAllStop:scheduleStatusAllStopped,
        recorderStatusAllStop:recorderStatusAllStopped,
        scheduleStatusAllSame,
        recorderStatusAllSame,
        recorderStatusAnyInTransition,
        intervalsForSelection
    } = props;

    const {
        startScheduleAll=()=>{},
        stopScheduleAll=()=>{},
        startRecordAll=()=>{},
        stopRecordAll=()=>{},
        changeAllIntervals=()=>{}
    } = props.HLSRecorderActions;

    const {
        setPlayerMountAll=()=>{}
    } = props.HLSPlayerActions;

    const scheduleButtonColor =  scheduleStatusAllStopped ? 'grey' : 'maroon';
    const recordButtonColor =  recorderStatusAllStopped ? 'grey' : 'maroon';

    const openDialog = React.useCallback(() => {
        openOptionsDialog();
    },[])
    
    const remount = React.useCallback(() => {
        setConfirmDialogTitle('Really Refresh Player?');
        setConfirmDialogText("All Players will be refreshed. OK?");
        setConfirmAction('remount');
        setConfirmOpen(true);
    },[])

    const allPlaybackOn = React.useCallback(() => {
        setPlayerMountAll({mountPlayer:true})
    },[])

    const allPlaybackOff = React.useCallback(() => {
        setPlayerMountAll({mountPlayer:false})
    },[])

    const reload = React.useCallback(() => {
        setConfirmDialogTitle('Caution! About to Reload Application!');
        setConfirmDialogText(`
            Reload will stop currently running recording!
        `);
        setConfirmAction('reload');
        setConfirmOpen(true);
    },[])

    const clearStatistics = React.useCallback(() => {
        setConfirmDialogTitle('Clear All Statistics. Continue?');
        setConfirmDialogText(`
            Do you really want to clear app and channel's statistics?
        `);
        setConfirmAction('clearStatistics');
        setConfirmOpen(true);
    },[])
    
    const openDirectory = React.useCallback(() => {
        remote.shell.openPath(BASE_DIRECTORY)
    },[BASE_DIRECTORY])

    const openHome = () => {
        const home = remote.app.getPath('home');
        remote.shell.openPath(home)

    }
    const openLogFolder = () => {
        const logFolder = remote.app.getPath('logs');
        remote.shell.openPath(logFolder)
    }
    const showStatistics = () => {
        setTooltipOpen(previous => {
            return !previous;
        })
    }

    const clearCache = () => {
        webFrame.clearCache();
    }

    const handleTooltipClose = () => {
        setTooltipOpen(false);
    }



    const {appStat} = props;
    const {refreshChannelClipCountStatistics} = props.StatisticsActions;
    const refreshClipCount = (event, channelNumber) => {
        console.log(`&&&&& got message from main : deleteScheduleDone ${channelNumber}`);
        refreshChannelClipCountStatistics({channelNumber});
    };

    React.useEffect(() => {
        ipcRenderer.on('deleteScheduleDone', refreshClipCount);
        return () => {
            ipcRenderer.removeListener('deleteScheduleDone', refreshClipCount);
        }
    },[])

    const AppStatComponent = () => {
        const StatLists = Object.entries(appStat).map(([statName, value]) => {
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
                titlewidth={"120px"}
                subject={statName}
                content={value}
            ></BorderedList>
        })
        return StatLists;
    }

    const classes = useStyles();
    return (      
        <Box 
            display="flex" 
            alignItems="center"
            bgcolor="#2d2f3b"
            ml="46px"
            // mr="50px"
            maxWidth="1638px"
            mt="15px"
            py="5px"
            alignContent="center"
            justifyContent="space-between"
            flexShrink="0"
        >
            <Box display="flex" alignItems="center" width="500px">
                <Tooltip
                    disableFocusListener 
                    disableTouchListener 
                    title="Refresh All Players"
                    arrow
                >
                    <Box>
                        <BasicIconButton aria-label="remount" onClick={remount}>
                            <RefreshIcon 
                                fontSize="large"
                                style={{color:"grey"}}
                            ></RefreshIcon>
                        </BasicIconButton>
                    </Box>
                </Tooltip>
                <Tooltip
                    disableFocusListener 
                    disableTouchListener 
                    title="Playback All On"
                    arrow
                >
                    <Box>
                        <BasicIconButton aria-label="playbackOff" onClick={allPlaybackOn}>
                            <TvIcon 
                                fontSize="large"
                                style={{color:"grey"}}
                            ></TvIcon>
                        </BasicIconButton>
                    </Box>
                </Tooltip>
                <Tooltip
                    disableFocusListener 
                    disableTouchListener 
                    title="Playback All Off"
                    arrow
                >
                    <Box>
                        <BasicIconButton aria-label="playbackOff" onClick={allPlaybackOff}>
                            <TvOffIcon 
                                fontSize="large"
                                style={{color:"grey"}}
                            ></TvOffIcon>
                        </BasicIconButton>
                    </Box>
                </Tooltip>
                <Tooltip
                    disableFocusListener 
                    disableTouchListener 
                    title="Start Recoding All"
                    arrow
                >
                    <Box>
                        <BasicIconButton 
                            aria-label="all recording" 
                            iconcolor={recordButtonColor}
                            onClick={recorderStatusAllStopped ? startRecordAll : stopRecordAll}
                            disabled={recorderStatusAnyInTransition || !recorderStatusAllSame}
                        >
                            <FiberManualRecordIcon 
                                fontSize="large"
                            ></FiberManualRecordIcon>
                        </BasicIconButton>
                    </Box>
                </Tooltip>
                <Tooltip
                    disableFocusListener 
                    disableTouchListener 
                    title="Start All Scheduled Recording"
                    arrow
                >
                    <Box>
                        <BasicIconButton 
                            aria-label="all schedule" 
                            iconcolor={scheduleButtonColor}
                            onClick={scheduleStatusAllStopped ? startScheduleAll : stopScheduleAll}
                            disabled={recorderStatusAnyInTransition || !scheduleStatusAllSame}
                        >
                            <AccessAlarmIcon 
                                fontSize="large"
                            ></AccessAlarmIcon>
                        </BasicIconButton>
                    </Box>
                </Tooltip>
                <Box ml="5px">
                    <OptionSelect
                        selectColor={"darkslategrey"}
                        disabled={!scheduleStatusAllStopped || recorderStatusAnyInTransition}
                        intervalsForSelection={intervalsForSelection}
                        minWidth="135px"
                        onChangeSelect={changeAllIntervals}
                        smallComponent={false}
                    ></OptionSelect>
                </Box>
                <ClickAwayListener onClickAway={handleTooltipClose}>
                    <Tooltip
                        open={tooltipOpen}
                        title={<AppStatComponent></AppStatComponent>}
                        classes={{ tooltip: classes.customWidth }}
                        disableFocusListener 
                        disableTouchListener 
                        arrow
                    >
                        <Box ml="5px">
                            <BasicIconButton 
                                aria-label="statistics" 
                                onClick={showStatistics}
                            >
                                <LiveHelpIcon 
                                    fontSize="large"
                                    style={{color:"grey"}}
                                ></LiveHelpIcon>
                            </BasicIconButton>
                        </Box>
                    </Tooltip>
                </ClickAwayListener>
                <Tooltip
                    disableFocusListener 
                    disableTouchListener 
                    title="Clear Statistics"
                    arrow
                >
                    <Box mr={"auto"}>
                        <BasicIconButton 
                            aria-label="statistics" 
                            onClick={clearStatistics}
                        >
                            <BackspaceIcon 
                                fontSize="large"
                                style={{color:"grey"}}
                            ></BackspaceIcon>
                        </BasicIconButton>
                    </Box>
                </Tooltip>
            </Box>
            <Box 
                fontFamily="Roboto, Helvetica, Arial, sans-serif" 
                textAlign="center" 
                fontSize="35px"
                textOverflow="hidden"
                whiteSpace="nowrap"
            >CCTV Recorder
            </Box>
            <Box display="flex" width="500px">
                <Tooltip
                    disableFocusListener 
                    disableTouchListener 
                    title="Reload Application"
                    arrow
                >
                    <Box ml="auto"> 
                        <BasicIconButton aria-label="reload" onClick={reload}>
                            <PowerSettingsNewIcon 
                                fontSize="large"
                                style={{color:"grey"}}
                            ></PowerSettingsNewIcon>
                        </BasicIconButton>
                    </Box>
                </Tooltip>
                <Tooltip
                    disableFocusListener 
                    disableTouchListener 
                    title="Home Directory"
                    arrow
                >
                    <Box>
                        <BasicIconButton aria-label="home directory" onClick={openHome}>
                            <HomeIcon 
                                fontSize="large"
                                style={{color:"grey"}}
                            ></HomeIcon>
                        </BasicIconButton>
                    </Box>
                </Tooltip>
                <Tooltip
                    disableFocusListener 
                    disableTouchListener 
                    title="Save Directory"
                    arrow
                >
                    <Box>
                        <BasicIconButton aria-label="open directory" onClick={openDirectory}>
                            <FolderOpenIcon 
                                fontSize="large"
                                style={{color:"grey"}}
                            ></FolderOpenIcon>
                        </BasicIconButton>
                    </Box>
                </Tooltip>
                <Tooltip
                    disableFocusListener 
                    disableTouchListener 
                    title="Log Directory"
                    arrow
                >
                    <Box>
                        <BasicIconButton aria-label="open log(debug)" onClick={openLogFolder}>
                            <BugReportIcon 
                                fontSize="large"
                                style={{color:"grey"}}
                            ></BugReportIcon>
                        </BasicIconButton>
                    </Box>
                </Tooltip>
                <Tooltip
                    disableFocusListener 
                    disableTouchListener 
                    title="clear memory"
                    arrow
                >
                    <Box>
                        <BasicIconButton aria-label="configuration" onClick={clearCache}>
                            <DeleteSweepIcon 
                                fontSize="large"
                                style={{color:"grey"}}
                            ></DeleteSweepIcon>
                        </BasicIconButton>
                    </Box>
                </Tooltip>
                <Tooltip
                    disableFocusListener 
                    disableTouchListener 
                    title="Configuration"
                    arrow
                >
                    <Box>
                        <BasicIconButton aria-label="configuration" onClick={openDialog}>
                            <SettingsIcon 
                                fontSize="large"
                                style={{color:"grey"}}
                            ></SettingsIcon>
                        </BasicIconButton>
                    </Box>
                </Tooltip>

            </Box>
        </Box>  

    );
};

export default React.memo(Header);