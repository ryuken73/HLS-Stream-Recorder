import React from 'react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import BorderedList from '../template/BorderedList';
import {SmallMarginTextField}  from '../template/smallComponents';

function Duration(props) {
    const {
        channelName="channelX", 
        recorderStatus="stopped", 
        duration="00:00:00.00",
        bgColors={}
    } = props;
    const inRecording = recorderStatus === 'started';
    const inTransition = recorderStatus === 'starting' || recorderStatus === 'stopping';
    const bgColor = bgColors[recorderStatus];
    const channel = {
        subject: <Typography variant="body1">{channelName}</Typography>,
        content: (
            <Box width="100%" m="0px"> 
                <SmallMarginTextField 
                    width="100%"
                    variant="outlined"
                    margin="dense"
                    bgcolor={bgColor}
                    value={duration}
                    fontSize={"12px"}
                    disabled={true}
                    mt={"2px"}
                    mb={"2px"}
                ></SmallMarginTextField> 
            </Box>
        ) 
    }
    return (
        <BorderedList 
            subject={channel.subject} 
            titlewidth={"80px"}
            content={channel.content} 
            border={1}
            ml={"3px"}
            my={"2px"}
            bgcolor={"#232738"}
        ></BorderedList>
    )
}

export default  React.memo(Duration)