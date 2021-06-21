import React, {useEffect, useState} from 'react';
import Box from '@material-ui/core/Box';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import {BasicIconButton} from './template/basicComponents';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import BottomMenuContainer from '../containers/BottomMenuContainer';;
import BodyContainer from '../containers/BodyContainer';
import OptionDialogContainer from '../containers/OptionDialogContainer';
import HeaderContainer from '../containers/HeaderContainer';
import ConfirmContainer from '../containers/ConfirmContainer';
import MessageContainer from '../containers/MessagePanelContainer';
import AutoReloadDialog from '../containers/AutoReloadContainer';
import AutoStartDialog from '../containers/AutoStartDialogContainer';
import AppMini from './AppMini';
import {ipcRenderer} from 'electron';
import socketIOClient from 'socket.io-client';

const { BrowserView, getCurrentWindow } = require('electron').remote;
const utils = require('../utils');

const theme = createMuiTheme({
  typography: {
    subtitle1: {
      fontSize: 12,
    },
    body1: {
      fontSize: 12,
      fontWeight: 500, 
    }
  }
});

const {getCombinedConfig} = require('../lib/getConfig');
const config = getCombinedConfig();
const {
  RECORD_MODE,
  MAX_MEMORY_RELOAD_WAIT_MS, 
  MAX_MEMORY_TO_RELOAD_MB,
  AUTO_START_SCHEDULE,
  AUTO_START_SCHEDULE_DELAY_MS,
  MEMORY_USAGE_PERCENTAGE_TO_AUTO_CLEAR,
  BROADCAST_SOCK_SERVER='http://127.0.0.1:9000/'
} = config;

function App(props) { 
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmAction, setConfirmAction] = React.useState('');
  const [confirmDialogTitle, setConfirmDialogTitle] = React.useState('Really Refresh Player?');
  const [confirmDialogText, setConfirmDialogText] = React.useState('All Players will be refreshed. OK?');
  const [reloadDialogOpen, setReloadDialogOpen] = React.useState(false);
  const [autoStartDialogOpen, setAutoStartDialogOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [minimized, setMinimized] = React.useState(false);

  const {goPage} = props.HLSPlayersActions;
  const {setSocket, bcastSetRecorders} = props.AppActions;
  const {scheduleStatusAllStop, recorderStatusAllStop} = props;
  const disableGoPageBtn = !recorderStatusAllStop || !scheduleStatusAllStop;
  const bgColorGoPageBtn = disableGoPageBtn ? 'black' : 'white';

  const changeSmallUI = () => {
    setMinimized(true);
    ipcRenderer.send('ready-small-UI');
  }

  React.useEffect(() => {
    setIsLoading(false);
    ipcRenderer.on('cmd-change-small-UI', changeSmallUI);
    return () => {
      ipcRenderer.removeListener('cmd-change-small-UI', changeSmallUI);
    }
  },[])
  
  React.useEffect(() => {
    if(AUTO_START_SCHEDULE === true){
      setAutoStartDialogOpen(true);
    }
  },[])

  React.useEffect(() => {
    const socket = socketIOClient.connect(BROADCAST_SOCK_SERVER);
    socket.on('connect', () => {
      setSocket({socket});
      console.log('connected');
      socket.emit('setMode', RECORD_MODE);
      bcastSetRecorders(socket);
    });
    socket.on('get:recorders', (data) => {
      console.log('socket: get:recorders');
      if(data === RECORD_MODE) bcastSetRecorders(socket);
    })
    return () => {
      socket.disconnect();
    }
  },[])

  const pageBack = () => {goPage({direction: 'prev'})};
  const pageForward = () => {goPage({direction: 'next'})};

  return (
    <ThemeProvider theme={theme}>
      {minimized &&
        <AppMini setMinimized={setMinimized}></AppMini>
      }
      {isLoading && !minimized &&
        <Box display="flex" height="100%">
          <Box m="auto" fontSize="30px">
              Loading.....
          </Box>
        </Box>
      }
      {!isLoading && !minimized &&
        <Box display="flex" flexDirection="column" height="1">
          <HeaderContainer 
            setConfirmOpen={setConfirmOpen}
            setConfirmAction={setConfirmAction}
            setConfirmDialogTitle={setConfirmDialogTitle}
            setConfirmDialogText={setConfirmDialogText}
          ></HeaderContainer>
          <Box 
            display="flex"
            alignItems="center"
          >
            <Box>
              <BasicIconButton 
                onClick={pageBack} 
                disabled={disableGoPageBtn}
                iconcolor={bgColorGoPageBtn}
              >
                <ArrowBackIosIcon fontSize="large"></ArrowBackIosIcon>
              </BasicIconButton>
            </Box>
            <BodyContainer></BodyContainer>
            <Box>
              <BasicIconButton 
                onClick={pageForward}
                disabled={disableGoPageBtn}
                iconcolor={bgColorGoPageBtn}
              >
                <ArrowForwardIosIcon fontSize="large"></ArrowForwardIosIcon>
              </BasicIconButton>
            </Box>
          </Box>
          <MessageContainer 
            mt="auto"
            maxMemory={MAX_MEMORY_TO_RELOAD_MB}
            memUsageToClear={MEMORY_USAGE_PERCENTAGE_TO_AUTO_CLEAR}
            setReloadDialogOpen={setReloadDialogOpen}
          ></MessageContainer> 
          <ConfirmContainer 
            open={confirmOpen} 
            setConfirmOpen={setConfirmOpen}
            confirmAction={confirmAction}
            confirmDialogTitle={confirmDialogTitle}
            confirmDialogText={confirmDialogText}
          ></ConfirmContainer>
          <OptionDialogContainer 
            title="Options"
            setConfirmOpen={setConfirmOpen}
            setConfirmAction={setConfirmAction}
            setConfirmDialogTitle={setConfirmDialogTitle}
            setConfirmDialogText={setConfirmDialogText}
          ></OptionDialogContainer>
          { reloadDialogOpen && 
            <AutoReloadDialog
              open={reloadDialogOpen}
              reloadWaitSeconds={MAX_MEMORY_RELOAD_WAIT_MS}
            >
            </AutoReloadDialog>
          }
          {autoStartDialogOpen &&
            <AutoStartDialog
              open={autoStartDialogOpen}
              setAutoStartDialogOpen={setAutoStartDialogOpen}
              scheduleStartDelay={AUTO_START_SCHEDULE_DELAY_MS}
            >
            </AutoStartDialog>
          }

        </Box>
      }
    </ThemeProvider>
  );
}

export default React.memo(App);
   