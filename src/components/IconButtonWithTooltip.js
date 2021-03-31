import React from 'react'
import Box from '@material-ui/core/Box';
import Tooltip from '@material-ui/core/Tooltip';
import {BasicIconButton} from './template/basicComponents';

function IconButtonWithTooltip(props) {
    const {title, label, iconcolor, onClick, disabled, children} = props;
    return (
        <Tooltip
            disableFocusListener 
            disableTouchListener 
            title={title}
            arrow
        >
            <Box>
                <BasicIconButton 
                    aria-label={label}
                    iconcolor={iconcolor}
                    onClick={onClick}
                    disabled={disabled}
                >
                    {children}
                </BasicIconButton>
            </Box>
        </Tooltip>
    )
}

export default React.memo(IconButtonWithTooltip);