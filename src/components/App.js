import React, {useEffect, useState} from 'react';
import Box from '@material-ui/core/Box';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import BottomMenuContainer from '../containers/BottomMenuContainer';;
import BodyContainer from '../containers/BodyContainer';
import OptionDialogContainer from '../containers/OptionDialogContainer';
import HeaderContainer from '../containers/HeaderContainer';
import ConfirmContainer from '../containers/ConfirmContainer';
import MessageContainer from '../containers/MessagePanelContainer';
import AutoReloadDialog from '../containers/AutoReloadContainer';
import AutoStartDialog from '../containers/AutoStartDialogContainer';

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
  MAX_MEMORY_RELOAD_WAIT_MS, 
  MAX_MEMORY_TO_RELOAD_MB,
  AUTO_START_SCHEDULE,
  AUTO_START_SCHEDULE_DELAY_MS,
  MEMORY_USAGE_PERCENTAGE_TO_AUTO_CLEAR
} = config;

function App(props) { 
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmAction, setConfirmAction] = React.useState('');
  const [confirmDialogTitle, setConfirmDialogTitle] = React.useState('Really Refresh Player?');
  const [confirmDialogText, setConfirmDialogText] = React.useState('All Players will be refreshed. OK?');
  const [reloadDialogOpen, setReloadDialogOpen] = React.useState(false);
  const [autoStartDialogOpen, setAutoStartDialogOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setIsLoading(false);
  },[])
  
  React.useEffect(() => {
    if(AUTO_START_SCHEDULE === true){
      setAutoStartDialogOpen(true);
    }
  },[])

  return (
    <ThemeProvider theme={theme}>
      {isLoading && 
        <Box display="flex" height="100%">
          <Box m="auto" fontSize="30px">
              Loading.....
          </Box>
        </Box>
      }
      {!isLoading &&
        <Box display="flex" flexDirection="column" height="1">
          <HeaderContainer 
            setConfirmOpen={setConfirmOpen}
            setConfirmAction={setConfirmAction}
            setConfirmDialogTitle={setConfirmDialogTitle}
            setConfirmDialogText={setConfirmDialogText}
          ></HeaderContainer>
          <BodyContainer></BodyContainer>
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
   