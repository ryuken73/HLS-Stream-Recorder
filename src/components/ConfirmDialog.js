import React from 'react';
import DraggabeDialog from './template/basicComponents/DraggableDialog';
import {remote} from 'electron';

function ConfirmDialog(props) {
    const {open, setConfirmOpen, confirmAction} = props;
    const {confirmDialogTitle = "Really Refresh Player?"} = props
    const {confirmDialogText = "All Players will be refreshed. OK?"} = props;
    const {setAppStatNStore, increaseAppStatNStore} = props.StatisticsActions;
    const {clearAppStatNStore, clearAllChannelStatNStore} = props.StatisticsActions;
    const {remountPlayerAll} = props.HLSPlayersActions;
    const executeAction = React.useCallback(() => {
        if(confirmAction === 'remount'){
            remountPlayerAll();
            return;
        }
        if(confirmAction === 'reload'){
            setAppStatNStore({statName:'reloadTimeManual', value:Date.now()});
            increaseAppStatNStore({statName:'reloadCountManual'});
            // remote.getCurrentWebContents().reload();
            remote.getCurrentWindow().reload();
            return
        }
        if(confirmAction === 'clearStatistics'){
            clearAllChannelStatNStore();
            clearAppStatNStore();
            return
        }
    },[confirmAction])
    return (
        <DraggabeDialog
            open={open}
            setOpen={setConfirmOpen}
            dialogTitle={confirmDialogTitle}
            dialogText={confirmDialogText}
            replyOK={executeAction}
        >           
        </DraggabeDialog>
    )
}

export default React.memo(ConfirmDialog);
