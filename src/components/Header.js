import React, { useEffect, useState } from 'react';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
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
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import OptionSelect from './template/OptionSelect';
import Tooltip from '@material-ui/core/Tooltip';
import {BasicIconButton, BasicIconButtonWithTooltip} from './template/basicComponents';
import IconButtonWithTooltip from './IconButtonWithTooltip';
import {webFrame} from 'electron';
import {ipcRenderer} from 'electron';
import {remote} from 'electron';

// import { makeStyles } from '@material-ui/core/styles';
// const useStyles = makeStyles((theme) => ({
//     customWidth: {
//       maxWidth: 500,
//     }
// }));

const Header = (props) => {
    // console.log('$$$$', props)
    const {setConfirmOpen=()=>{}, setConfirmAction=()=>{}} = props;
    const {setConfirmDialogTitle=()=>{}, setConfirmDialogText=()=>{}} = props;
    const {BASE_DIRECTORY="c:/temp"} =  props.config;
    const [tooltipOpen, setTooltipOpen] = useState(false);

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
    const path = require('path');
    const openConfigFolder = () => {
        const execBinary = remote.app.getPath('exe');
        const configFolder = path.join(path.dirname(execBinary),'resources','app.asar.unpacked','config','default');
        console.log(configFolder)
        remote.shell.openPath(configFolder)
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

    useEffect(() => {
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

    // const classes = useStyles();
    return (      
        <Box 
            display="flex" 
            alignItems="center"
            bgcolor="#2d2f3b"
            ml="55px"
            // mr="50px"
            maxWidth="1638px"
            mt="15px"
            py="5px"
            alignContent="center"
            justifyContent="space-between"
            flexShrink="0"
        >
            <Box display="flex" alignItems="center" width="500px">
                <IconButtonWithTooltip
                    title="Start All Scheduled Recording"
                    label="all schedule"
                    iconcolor={scheduleButtonColor}
                    onClick={scheduleStatusAllStopped ? startScheduleAll : stopScheduleAll}
                    disabled={recorderStatusAnyInTransition || !scheduleStatusAllSame}
                >
                    <AccessAlarmIcon 
                        fontSize="large"
                    ></AccessAlarmIcon>
                </IconButtonWithTooltip>
                <IconButtonWithTooltip
                    title="Start Recoding All"
                    label="all recording"
                    iconcolor={recordButtonColor}
                    onClick={recorderStatusAllStopped ? startRecordAll : stopRecordAll}
                    disabled={recorderStatusAnyInTransition || !recorderStatusAllSame}
                >
                    <FiberManualRecordIcon 
                        fontSize="small"
                    ></FiberManualRecordIcon>
                </IconButtonWithTooltip>
                <IconButtonWithTooltip
                    title="Refresh All Players"
                    label="remount"
                    onClick={remount}
                    disabled={false}
                >
                    <RefreshIcon 
                        fontSize="default"
                        style={{color:"grey"}}
                    ></RefreshIcon>
                </IconButtonWithTooltip>
                <IconButtonWithTooltip
                    title="Playback All On"
                    label="playbackOn"
                    onClick={allPlaybackOn}
                    disabled={false}
                >
                    <TvIcon 
                        fontSize="default"
                        style={{color:"grey"}}
                    ></TvIcon>
                </IconButtonWithTooltip>
                <IconButtonWithTooltip
                    title="Playback All Off"
                    label="playbackOff"
                    onClick={allPlaybackOff}
                    disabled={false}
                >
                    <TvOffIcon 
                        fontSize="default"
                        style={{color:"grey"}}
                    ></TvOffIcon>
                </IconButtonWithTooltip>
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
                        // classes={{ tooltip: classes.customWidth }}
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
                                    fontSize="default"
                                    style={{color:"grey"}}
                                ></LiveHelpIcon>
                            </BasicIconButton>
                        </Box>
                    </Tooltip>
                </ClickAwayListener>
                <IconButtonWithTooltip
                    title="Clear Statistics"
                    label="statistics"
                    onClick={clearStatistics}
                    disabled={false}
                >
                    <BackspaceIcon 
                        fontSize="default"
                        style={{color:"grey"}}
                    ></BackspaceIcon>
                </IconButtonWithTooltip>
            </Box>
            <Box 
                fontFamily="Roboto, Helvetica, Arial, sans-serif" 
                textAlign="center" 
                fontSize="35px"
                textOverflow="hidden"
                whiteSpace="nowrap"
            >CCTV Recorder
            </Box>
            <Box display="flex" width="500px" alignItems="center">
                <Box ml="auto">
                    <IconButtonWithTooltip
                        title="Reload Application"
                        label="reload"
                        onClick={reload}
                        disabled={false}
                    >
                        <PowerSettingsNewIcon 
                            fontSize="default"
                            style={{color:"grey"}}
                        ></PowerSettingsNewIcon>
                    </IconButtonWithTooltip>
                </Box>
                <IconButtonWithTooltip
                    title="Home Directory"
                    label="home directory"
                    onClick={openHome}
                    disabled={false}
                >
                    <HomeIcon 
                        fontSize="default"
                        style={{color:"grey"}}
                    ></HomeIcon>
                </IconButtonWithTooltip>
                <IconButtonWithTooltip
                    title="Save Directory"
                    label="save directory"
                    onClick={openDirectory}
                    disabled={false}
                >
                    <FolderOpenIcon 
                        fontSize="default"
                        style={{color:"grey"}}
                    ></FolderOpenIcon>
                </IconButtonWithTooltip>
                <IconButtonWithTooltip
                    title="Log Directory"
                    label="open log(debug)"
                    onClick={openLogFolder}
                    disabled={false}
                >
                    <BugReportIcon 
                        fontSize="default"
                        style={{color:"grey"}}
                    ></BugReportIcon>
                </IconButtonWithTooltip>
                <IconButtonWithTooltip
                    title="config file"
                    label="config file"
                    onClick={openConfigFolder}
                    disabled={false}
                >
                    <InsertDriveFileIcon 
                        fontSize="default"
                        style={{color:"grey"}}
                    ></InsertDriveFileIcon>
                </IconButtonWithTooltip>
                <IconButtonWithTooltip
                    title="clear memory"
                    label="clear cache"
                    onClick={clearCache}
                    disabled={false}
                >
                    <DeleteSweepIcon 
                        fontSize="default"
                        style={{color:"grey"}}
                    ></DeleteSweepIcon>
                </IconButtonWithTooltip>
                <IconButtonWithTooltip
                    title="Configuration"
                    label="configuration"
                    onClick={openDialog}
                    disabled={false}
                >
                    <SettingsIcon 
                        fontSize="large"
                        style={{color:"grey"}}
                    ></SettingsIcon>
                </IconButtonWithTooltip>
            </Box>
        </Box>  

    );
};

export default React.memo(Header);