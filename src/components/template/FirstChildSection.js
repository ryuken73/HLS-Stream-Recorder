import React from 'react';
import Box from '@material-ui/core/Box';
import BorderdBox from './BorderedBox';

const defaultProps = {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    flexShrink: 0,
    boxSizing: 'border-box',
    overflow: "auto",
    minWidth: 'fit-content'
}

export default function FirstChildSection({children, ...props}) {
    return (
        <Box className="FirstChildSection" {...defaultProps} {...props}>
                {children}
        </Box>
    )
}
