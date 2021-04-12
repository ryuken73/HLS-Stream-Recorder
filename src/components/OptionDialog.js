import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import OptionTextInput from './template/OptionTextInput';
import OptionRadioButton from './template/OptionRadioButton';
import FolderIcon  from '@material-ui/icons/Folder';
import {SmallPaddingIconButton} from './template/smallComponents';
import utils from '../utils';

const { dialog } = require('electron').remote;

const INPUT_WIDTH='300px'
const SUBTITLE_WIDTH='30%';

const OptionTextInputWithDefault = React.memo(props => {
  const {children} = props;
  return <OptionTextInput 
            subTitleWidth={SUBTITLE_WIDTH} 
            inputWidth={INPUT_WIDTH} 
            border="0" 
            color="black" 
            bgcolor="white" 
            textColor="black" 
            textalign="left"
            my="0px"
            {...props}
          >
            {children}
          </OptionTextInput>
})

const boolLabels = [
  {value: true, label: 'YES'},
  {value: false, label: 'NO'}
]

const OptionRadioButtonWithDefault = props => {
  const {children} = props;
  return <OptionRadioButton 
          titlewidth={SUBTITLE_WIDTH} 
          formlabels={boolLabels} 
          border="0" 
          color="black" 
          bgcolor='white' 
          {...props}
        >
          {children}
        </OptionRadioButton>
}
function OptionDialog(props) {
  const [valueChanged, setValueChanged] = React.useState(false);
  const {setConfirmOpen, setConfirmAction, setConfirmDialogTitle, setConfirmDialogText} = props;
  const {title="Dialog Box"} = props;
  const {dialogOpen=true, config} = props;
  const {
    NUMBER_OF_CHANNELS,
    CHANNEL_PREFIX="channel",
    LOG_LEVEL='info',
    WAIT_SECONDS_MS_FOR_PLAYBACK_CHANGE,
    LONG_BUFFERING_MS_SECONDS,
    DEFAULT_PLAYER_PROPS,
    BASE_DIRECTORY="c:/temp",
    KEEP_SAVED_CLIP_AFTER_HOURS,
    DELETE_SCHEDULE_CRON,
    MAX_MEMORY_TO_RELOAD_MB,
    MAX_MEMORY_RELOAD_WAIT_MS,
    AUTO_START_SCHEDULE,
    AUTO_START_SCHEDULE_DELAY_MS,
    MEMORY_USAGE_PERCENTAGE_TO_AUTO_CLEAR,
    KAFKA_ENABLED,
    KAFKA_CLIENT_NAME,
    MEM_CLEAR_COUNT_LIMIT,
    AUTO_RELOAD_OVER_MEM_CLEAR_COUNT_LIMIT,
    IDLE_SECONDS_BEFORE_CLOSE_PLAYBACK
  } = config;
  const {setOptionsDialogOpen=()=>{}, saveConfig=()=>{}} = props.OptionDialogActions;
  const {setDefaultConfig=()=>{}} = props.OptionDialogActions;
  const {setConfigValue=()=>{}} = props.OptionDialogActions;

  const [scroll, setScroll] = React.useState('paper');

  const stringToBool = value => {
    if(value === 'true') return true; 
    if(value === 'false') return false; 
    return value;
  }

  const onChangeConfig = React.useCallback(configName => {
    return event => {
      setValueChanged(true);
      // console.log(configName, event.target.value, typeof(event.target.value));
      const nomalizedValue = stringToBool(event.target.value)
      setConfigValue({configName, value: nomalizedValue})
    }
  },[]);

  const handleClose = React.useCallback(() => {
    setOptionsDialogOpen({dialogOpen:false});
  },[]);

  const onClickSelectSaveDirectory = () => {
    dialog.showOpenDialog({properties:['openDirectory']})
    .then(result => {
      const {filePaths} = result;
      if(filePaths === undefined) return;
      setConfigValue({configName:'BASE_DIRECTORY', value:filePaths[0]});
      setValueChanged(true);
    })
    .catch(err => console.error(err))
  }
 
  const onClickSaveBtn = () => {
    saveConfig({config});
    handleClose();
    if(valueChanged){
      setConfirmDialogTitle('Caution! Reload Required!')
      setConfirmDialogText(`
        Reload is required for changes to take effect.
        scheduled recording will be stopped!
      `)
      setConfirmAction('reload');
      setConfirmOpen(true);

    }
  }

  const SaveDirectoryButton = (
    <SmallPaddingIconButton 
        onClick={onClickSelectSaveDirectory} 
        aria-label="select save directory button"
        iconcolor="black"
      >
        <FolderIcon fontSize="small" />
    </SmallPaddingIconButton>
  )

  return (
    
    <Dialog
      open={dialogOpen}
      onClose={handleClose}
      scroll={scroll}
      aria-labelledby="scroll-dialog-title"
      aria-describedby="scroll-dialog-description"
      fullWidth
    >
    <DialogTitle id="scroll-dialog-title">
      {title}
    </DialogTitle>
    <DialogContent dividers={scroll === 'paper'}>
      <DialogContentText
        id="scroll-dialog-description"
        tabIndex={-1}
      >
        <OptionTextInputWithDefault key="NUMBER_OF_CHANNELS" subtitle='Number of Recorders' value={NUMBER_OF_CHANNELS} onChange={onChangeConfig('NUMBER_OF_CHANNELS')}></OptionTextInputWithDefault>
        {/* <OptionTextInputWithDefault subtitle='Instance Name' value={INSTANCE_NAME} onChange={onChangeConfig('INSTANCE_NAME')}></OptionTextInputWithDefault> */}
        <OptionTextInputWithDefault key="CHANNEL_PREFIX" subtitle='Channel Prefix' value={CHANNEL_PREFIX} onChange={onChangeConfig('CHANNEL_PREFIX')}></OptionTextInputWithDefault>
        <OptionTextInputWithDefault key="LOG_LEVEL" subtitle='Log Level' value={LOG_LEVEL} onChange={onChangeConfig('LOG_LEVEL')}></OptionTextInputWithDefault>
        <OptionTextInputWithDefault key="KEEP_SAVED_CLIP_AFTER_HOURS" subtitle='Clip Keeping Hours(hh)' value={KEEP_SAVED_CLIP_AFTER_HOURS} onChange={onChangeConfig('KEEP_SAVED_CLIP_AFTER_HOURS')}></OptionTextInputWithDefault>
        <OptionTextInputWithDefault key="LONG_BUFFERING_MS_SECONDS" subtitle='Long Buffering(ms)' value={LONG_BUFFERING_MS_SECONDS} onChange={onChangeConfig('LONG_BUFFERING_MS_SECONDS')}></OptionTextInputWithDefault>
        <OptionTextInputWithDefault key="WAIT_SECONDS_MS_FOR_PLAYBACK_CHANGE" subtitle='Wait for Playback(ms)' value={WAIT_SECONDS_MS_FOR_PLAYBACK_CHANGE} onChange={onChangeConfig('WAIT_SECONDS_MS_FOR_PLAYBACK_CHANGE')}></OptionTextInputWithDefault>
        {/* <OptionTextInputWithDefault subtitle='Delay All Starting(ms)' value={SLEEP_MS_BETWEEN_ALL_START} onChange={onChangeConfig('SLEEP_MS_BETWEEN_ALL_START')}></OptionTextInputWithDefault> */}
        {/* <OptionTextInputWithDefault subtitle='Delay All Stopping(ms)' value={SLEEP_MS_BETWEEN_ALL_STOP} onChange={onChangeConfig('SLEEP_MS_BETWEEN_ALL_STOP')}></OptionTextInputWithDefault> */}
        <OptionTextInputWithDefault key="AUTO_START_SCHEDULE_DELAY_MS" subtitle='Schedule Start Delay(ms)' value={AUTO_START_SCHEDULE_DELAY_MS} onChange={onChangeConfig('AUTO_START_SCHEDULE_DELAY_MS')}></OptionTextInputWithDefault>
        <OptionTextInputWithDefault key="SAVE_DIR" subtitle='Save Directory' value={BASE_DIRECTORY} iconButton={SaveDirectoryButton}></OptionTextInputWithDefault>
        <OptionTextInputWithDefault key="DELETE_SCHEDULE_CRON" subtitle='Delete Schedule Cron' value={DELETE_SCHEDULE_CRON} onChange={onChangeConfig('DELETE_SCHEDULE_CRON')}></OptionTextInputWithDefault>
        <OptionTextInputWithDefault key="MAX_MEMORY_TO_RELOAD_MB" subtitle='Max Memory' value={MAX_MEMORY_TO_RELOAD_MB} onChange={onChangeConfig('MAX_MEMORY_TO_RELOAD_MB')}></OptionTextInputWithDefault>
        <OptionTextInputWithDefault key="MEMORY_USAGE_PERCENTAGE_TO_AUTO_CLEAR" subtitle='High Memory Usage(%)' value={MEMORY_USAGE_PERCENTAGE_TO_AUTO_CLEAR} onChange={onChangeConfig('MEMORY_USAGE_PERCENTAGE_TO_AUTO_CLEAR')}></OptionTextInputWithDefault>
        <OptionTextInputWithDefault key="MEM_CLEAR_COUNT_LIMIT" subtitle='Clear Memory Limit' value={MEM_CLEAR_COUNT_LIMIT} onChange={onChangeConfig('MEM_CLEAR_COUNT_LIMIT')}></OptionTextInputWithDefault>
        <OptionRadioButtonWithDefault key="AUTO_RELOAD_OVER_MEM_CLEAR_COUNT_LIMIT" subtitle='Auto Reload Over Limit' currentvalue={AUTO_RELOAD_OVER_MEM_CLEAR_COUNT_LIMIT} onChange={onChangeConfig('AUTO_RELOAD_OVER_MEM_CLEAR_COUNT_LIMIT')}></OptionRadioButtonWithDefault>
        <OptionRadioButtonWithDefault key="AUTO_START_SCHEDULE" subtitle="Schedule Auto Start" currentvalue={AUTO_START_SCHEDULE} onChange={onChangeConfig('AUTO_START_SCHEDULE')}></OptionRadioButtonWithDefault>
        <OptionRadioButtonWithDefault key="KAFKA_ENABLED" subtitle="Enable Kafka Send" currentvalue={KAFKA_ENABLED} onChange={onChangeConfig('KAFKA_ENABLED')}></OptionRadioButtonWithDefault>
        <OptionTextInputWithDefault key="KAFKA_CLIENT_NAME" subtitle='Kafka Host Name' value={KAFKA_CLIENT_NAME} onChange={onChangeConfig('KAFKA_CLIENT_NAME')}></OptionTextInputWithDefault>
        <OptionTextInputWithDefault key="IDLE_SECONDS_BEFORE_CLOSE_PLAYBACK" subtitle='Idle Seconds Player Off' value={IDLE_SECONDS_BEFORE_CLOSE_PLAYBACK} onChange={onChangeConfig('IDLE_SECONDS_BEFORE_CLOSE_PLAYBACK')}></OptionTextInputWithDefault>
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button style={{marginRight:'auto'}} onClick={setDefaultConfig} color="primary">
        Default
      </Button>
      <Button onClick={handleClose} color="primary">
        Cancel
      </Button>
      <Button onClick={onClickSaveBtn} color="primary">
        Save
      </Button>
    </DialogActions>
  </Dialog>
  )
}


export default React.memo(OptionDialog)