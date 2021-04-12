import React from 'react'
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import BorderedList from './BorderedList';
import {SmallMarginTextField} from './smallComponents';


export default function OptionTextInput(props) {    
    const {subtitle, subTitleWidth:titlewidth="20%", inputWidth:width, value, iconButton} = props;
    const Subject = () => {
        return <Typography component={'span'} variant="body1">{subtitle}</Typography>;
    }
    const Content = () => {
        return  <Box display="flex" width={width}>
                    <SmallMarginTextField 
                        variant="outlined"
                        margin="dense"
                        value={value}
                        fullWidth      
                        {...props}               
                    ></SmallMarginTextField> 
                    {iconButton}
                </Box>
    }
    const {onChange, ...restProps} = props;
    return (
        <BorderedList 
            subject={<Subject></Subject>} 
            titlewidth={titlewidth}
            content={<Content></Content>}
            border={1}
            {...restProps}
        ></BorderedList>
    )
}
