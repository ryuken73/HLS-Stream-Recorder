import React from 'react'
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import BorderedList from './BorderedList';
import {SmallMarginTextField} from './smallComponents';
// export default function OptionTextInput(props) {
//     const {subtitle, subTitleWidth:titlewidth="20%", inputWidth:width, value, iconButton} = props;
//     const optionText = {
//         subject: <Typography component={'span'} variant="body1">{subtitle}</Typography>,
//         content:  (
//             <Box display="flex" width={width}>
//                 <SmallMarginTextField 
//                     variant="outlined"
//                     margin="dense"
//                     value={value}
//                     fullWidth      
//                     {...props}               
//                 ></SmallMarginTextField> 
//                 {iconButton}
//             </Box>
//         )
//     }
//     return (
//         <BorderedList 
//             subject={optionText.subject} 
//             titlewidth={titlewidth}
//             content={optionText.content}
//             border={1}
//             {...props}
//         ></BorderedList>
//     )
//     }

const Subject = (props) => {
    const {subtitle} = props;
    return <Typography component={'span'} variant="body1">{subtitle}</Typography>;
}
const Content = (props) => {
    const {width, value, iconButton} = props;
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

export default function OptionTextInput(props) {    
    const {subtitle, subTitleWidth:titlewidth="20%", inputWidth:width, value, iconButton} = props;
    const {onChange, ...restProps} = props;
    return (
        <BorderedList 
            subject={<Subject subtitle={subtitle}></Subject>} 
            titlewidth={titlewidth}
            content={<Content value={value} width={width} iconButton={iconButton} {...props}></Content>}
            border={1}
            {...restProps}
        ></BorderedList>
    )
}
