import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import {remote} from 'electron';


function AutoReloadDialog(props) {
  console.log('*********', props)
  const {open, reloadWaitSeconds=5000} = props;
  const {setAppStatNStore, increaseAppStatNStore} = props.StatisticsActions;
  const {stopRecordAll} = props.HLSRecorderActions;
  const [remainSeconds, setRemainSeconds] = React.useState(parseInt((reloadWaitSeconds/1000).toFixed(0)));
  const [timer, setTimer] = React.useState(null);
  
  if(remainSeconds === 0) {
    clearInterval(timer);
    stopRecordAll()
    .then(() => {
      setAppStatNStore({statName:'reloadTimeAutomatic', value:Date.now()})
      increaseAppStatNStore({statName:'reloadCountAutomatic'})
      remote.getCurrentWebContents().reload();
    })
  }
  
  React.useEffect(() => {
    const timer = setInterval(() => {
        setRemainSeconds(previousRemainSeconds => {
            return previousRemainSeconds - 1
        })
    },1000)
    setTimer(timer);
  },[])

  const dialogMessage = remainSeconds === 0 ? 
                        "Wait for recorders to stop..." : 
                        `Reload in ${remainSeconds} seconds!`

  return (
    <div>
      <Dialog
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"WARN! Too Much Memory Used!"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {dialogMessage}
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default React.memo(AutoReloadDialog)