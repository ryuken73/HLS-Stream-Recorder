import React from 'react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import BorderedList from '../template/BorderedList';
import {SmallMarginTextField}  from '../template/smallComponents';

function SourceRecording(props) {
    // console.log('rerender Title:', props)
    const {
        channelNumber=1,
        title="None",
        hidden="false"
    } = props;
    const sourceDisplay = {
        subject: <Typography variant="body1">source</Typography>,
        content: (
            <Box width="100%" m="0px"> 
                <SmallMarginTextField 
                    width="100%"
                    variant="outlined"
                    margin="dense"
                    bgcolor={"#2d2f3b"}
                    value={title}
                    fontSize={"12px"}
                    disabled={true}
                    mt={"0px"}
                    mb={"0px"}
                    textalign={"left"}
                ></SmallMarginTextField> 
            </Box>
        ) 
    }
    return (
        <BorderedList 
            subject={sourceDisplay.subject} 
            titlewidth={"80px"}
            content={sourceDisplay.content} 
            // color={"white"}
            border={1}
            ml={"3px"}
            mt={"0px"}
            mb={"1px"}
            bgcolor={"#232738"}
            hidden={hidden}
        ></BorderedList>
    )
}

export default  React.memo(SourceRecording)