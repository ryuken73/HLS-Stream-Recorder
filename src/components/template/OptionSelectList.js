import React from 'react'
import Typography from '@material-ui/core/Typography';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import BorderedList from './BorderedList';
import {SmallPaddingSelect}  from './smallComponents';


export default function OptionSelectList(props) {
    console.log('re-render option selectionlist:', props.currentItem, props.menuItems)
    const {subtitle, minWidth, currentItem, menuItems, onChangeSelect, multiple=true, titlewidth="20%", bgcolor, selectColor, disabled=false} = props;
    const {mb="0px", mt="0px", maxWidth} = props;
    const {smallComponent} = props;
    const {hidden=false} = props
    const SelectComponent = smallComponent ? SmallPaddingSelect : Select;
    const Subject = () => {
        return <Typography component={'span'} variant="body1">{subtitle}</Typography>;
    }
    const Content = () => {
        return  <React.Fragment>
                    <FormControl style={{minWidth:minWidth, width:"100%", maxWidth:maxWidth}}>
                        <SelectComponent
                            labelId="select-label" 
                            variant="outlined"
                            margin="dense"
                            value={currentItem}
                            multiple={multiple}
                            onChange={onChangeSelect}
                            bgcolor={selectColor}
                            disabled={disabled}
                        >
                            {menuItems.map((menuItem, index) => {
                                const {value, label} = menuItem;
                                return <MenuItem key={index} value={value}>{label}</MenuItem>
                            })}
                        </SelectComponent>
                    </FormControl>
                </React.Fragment>
    }
    return (
        <BorderedList 
            subject={<Subject></Subject>} 
            titlewidth={titlewidth}
            content={<Content></Content>} 
            mb={mb}
            mt={mt}
            bgcolor={bgcolor}
            hidden={hidden}
        ></BorderedList>
    )
}
