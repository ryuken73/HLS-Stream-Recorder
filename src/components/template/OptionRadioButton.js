import React from 'react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import FormControl from '@material-ui/core/FormControl';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import BorderedList from './BorderedList';
import {SmallPaddingFormControlLabel} from './smallComponents';


export default function OptionRadioButton(props) {
    const {subtitle, value, onChange, titlewidth="20%"} = props;
    const {formlabels} = props;
    const Subject = () => {
        return <Typography component={'span'} variant="body1">{subtitle}</Typography>;
    };
    const Content = () => {
        return  <React.Fragment>
                    <FormControl component="fieldset">
                        <RadioGroup aria-label="radioButton" name={name} onChange={onChange} {...props}>
                            <Box display="flex">
                                {formlabels.map((formLabel,index)=> {
                                    const {disabled, value, label} = formLabel;
                                    return <SmallPaddingFormControlLabel key={index} disabled={disabled} value={value} control={<Radio />} label={label} />
                                })}
                            </Box>
                        </RadioGroup>
                    </FormControl>
                </React.Fragment>
    }
    // const optionRadio = {
    //     subject: <Typography component={'span'} variant="body1">{subtitle}</Typography>,
    //     content:  (
    //         <React.Fragment>
    //             <FormControl component="fieldset">
    //                 <RadioGroup aria-label="radioButton" name="radioButton" onChange={onChange} value={currentvalue}>
    //                     <Box display="flex">
    //                         {formlabels.map((formLabel,index)=> {
    //                             const {disabled, value, label} = formLabel;
    //                             return <SmallPaddingFormControlLabel key={index} disabled={disabled} value={value} control={<Radio />} label={label} />
    //                         })}
    //                     </Box>
    //                 </RadioGroup>
    //             </FormControl>
    //         </React.Fragment>
    //     )
    // }
    return (
        <BorderedList 
            subject={<Subject></Subject>} 
            titlewidth={titlewidth}
            content={<Content></Content>} 
            border={1}
            {...props}
        ></BorderedList>
    )
}
