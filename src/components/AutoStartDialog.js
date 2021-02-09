import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import {remote} from 'electron';


function AutoStartDialog(props) {
  console.log('*********', props)
  const {open, scheduleStartDelay=5000, setAutoStartDialogOpen} = props;
  const {startScheduleAll} = props.HLSRecorderActions;
  const [remainSeconds, setRemainSeconds] = React.useState(parseInt((scheduleStartDelay/1000).toFixed(0)));
  const [timer, setTimer] = React.useState(null);
  
  if(remainSeconds === 0) {
    clearInterval(timer);
    startScheduleAll()
    .then(() => {
      setAutoStartDialogOpen(false);
    })
  }
  
  React.useEffect(() => {
    const timer = setInterval(() => {
        setRemainSeconds(previousRemainSeconds => {
            return previousRemainSeconds - 1
        })
    },1000)
    setTimer(timer);
    return () => {
      clearInterval(timer);
    }
  },[])

  const handleClose = () => {
    setAutoStartDialogOpen(false);
  };

  const cancelStart = () => {
    setAutoStartDialogOpen(false);
  }

  const dialogMessage = remainSeconds === 0 ? 
                        "Wait for recorders to start..." : 
                        `Sstart schedule in ${remainSeconds} seconds!`

  return (
    <div>
      <Dialog
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Automatic Schedule Start!"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {dialogMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            {remainSeconds === 0 ? "Close" : "Cancel"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default React.memo(AutoStartDialog)