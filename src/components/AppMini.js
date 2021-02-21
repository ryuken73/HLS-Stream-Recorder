import React from 'react'
import {ipcRenderer} from 'electron';

export default function AppMini(props) {
    const {setMinimized} = props;
    const restoreWindow = () => {
        ipcRenderer.send('mini-ui-umounted')
        setMinimized(false);
    }
    React.useEffect(() => {
        ipcRenderer.send('mini-ui-mounted')
    })
    return (
        <div>
            Mini UI...
            <button onClick={restoreWindow}>Restore UI</button>
        </div>
    )
}
