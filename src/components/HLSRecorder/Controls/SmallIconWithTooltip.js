import React from 'react'
import Tooltip from '@material-ui/core/Tooltip';
import {SmallPaddingIconButton}  from '../../template/smallComponents';


const SmallIconWithTooltip = (props) => {
    const {title, onclick=()=>{}, disabled=false, open, children} = props;
    return (
        <Tooltip
            title={title}
            placement="right"
            open={open}
            disableFocusListener 
            disableTouchListener 
            arrow
        >
            <SmallPaddingIconButton 
                padding="1px" 
                size="small" 
                iconcolor="black"
                onClick={onclick}
                disabled={disabled}
            >
                {children}
            </SmallPaddingIconButton>
        </Tooltip>
    )
}
export default React.memo(SmallIconWithTooltip)