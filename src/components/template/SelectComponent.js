import React from 'react'
import Typography from '@material-ui/core/Typography';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import BorderedList from './BorderedList';
import {SmallPaddingSelect}  from './smallComponents';
import {BasicSelect}  from './basicComponents';


export default function SelectComponent(props) {
    const {
        minWidth, 
        currentItem, 
        menuItems=[], 
        onChangeSelect, 
        multiple=false,  
        selectColor, 
        disabled=false,
        fontcolor="white",
        ml="2px"
    } = props;    
    const {small} = props;
    const SelectComponent = small ? SmallPaddingSelect : BasicSelect;
    return (
        <FormControl style={{minWidth:minWidth,width:"100%",marginTop:ml }}>
            <SelectComponent
                labelId="select-label" 
                variant="outlined"
                value={currentItem}
                multiple={multiple}
                onChange={onChangeSelect}
                bgcolor={selectColor}
                disabled={disabled}
                fontcolor={fontcolor}
            >
                {menuItems.map((menuItem, index) => {
                    const {value, label} = menuItem;
                    return <MenuItem key={index} value={value}>{label}</MenuItem>
                })}
            </SelectComponent>
        </FormControl>  
    )
}
