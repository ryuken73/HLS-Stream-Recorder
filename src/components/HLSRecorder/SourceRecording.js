import React from 'react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import BorderedList from '../template/BorderedList';
import {SmallMarginTextField}  from '../template/smallComponents';

function SourceRecording(props) {
    const {
        channelNumber=1,
        title="None",
        hidden="false"
    } = props;

    const Subject = () => {
        return <Typography variant="body1">source</Typography>;
    }
    const Content = () => {
        return  <Box width="100%" m="0px"> 
                    <SmallMarginTextField 
                        width="100%"
                        variant="outlined"
                        margin="dense"
                        bgcolor={"#2d2f3b"}
                        value={title}
                        fontSize={"12px"}
                        disabled={true}
                        mt={"3px"}
                        mb={"2px"}
                        textalign={"left"}
                    ></SmallMarginTextField> 
                </Box>  
    }

    // const sourceDisplay = {
    //     subject: <Typography variant="body1">source</Typography>,
    //     content: (
    //         <Box width="100%" m="0px"> 
    //             <SmallMarginTextField 
    //                 width="100%"
    //                 variant="outlined"
    //                 margin="dense"
    //                 bgcolor={"#2d2f3b"}
    //                 value={title}
    //                 fontSize={"12px"}
    //                 disabled={true}
    //                 mt={"3px"}
    //                 mb={"2px"}
    //                 textalign={"left"}
    //             ></SmallMarginTextField> 
    //         </Box>
    //     ) 
    // }
    return (
        <BorderedList 
            subject={<Subject></Subject>} 
            titlewidth={"80px"}
            content={<Content></Content>} 
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