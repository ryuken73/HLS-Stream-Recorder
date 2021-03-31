import React from 'react'
import Typography from '@material-ui/core/Typography';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import BorderedList from './BorderedList';
import {SmallPaddingSelect}  from './smallComponents';
import {BasicSelect}  from './basicComponents';


function OptionSelectList(props) {
    const {
        maxWidth="100%", 
        minWidth="30%", 
        currentItem=3600000, 
        intervalsForSelection=[{label:'title', value:'good'}]
    }=props;

    const [currentValue, setCurrentValue] = React.useState(currentItem);
    const [customStyle, setCustomStyle] = React.useState({minWidth:minWidth, width:"100%", maxWidth:maxWidth})
    const [selectItems, setSelectItems] = React.useState(intervalsForSelection.map(interval => {
        return {
            value: interval.milliseconds,
            label: interval.title
        }
    }));

    const {
        onChangeSelect=()=>{}, 
        multiple=false, 
        selectColor="white", 
        disabled=false
    } = props;

    const {smallComponent=true} = props;
    const SelectComponent = smallComponent ? SmallPaddingSelect : BasicSelect;

    React.useEffect(() => {
        setCustomStyle({minWidth:minWidth, width:"100%", maxWidth:maxWidth});
    }, [minWidth, maxWidth])

    React.useEffect(() => {
        setSelectItems(intervalsForSelection.map(interval => {
            return {
                value: interval.milliseconds,
                label: interval.title
            }
        }));
    }, [intervalsForSelection])

    const changeCurrentItem = React.useCallback(event => {
        const {value} = event.target;
        setCurrentValue(value)
        onChangeSelect(value);
    },[]);
    
    return (
        <React.Fragment>
        <FormControl style={customStyle}>
            <SelectComponent
                labelId="select-label" 
                variant="outlined"
                margin="dense"
                value={currentValue}
                multiple={multiple}
                onChange={changeCurrentItem}
                bgcolor={selectColor}
                disabled={disabled}
            >
                {selectItems.map((menuItem, index) => {
                    const {value, label} = menuItem;
                    return <MenuItem key={index} value={value}>{label}</MenuItem>
                })}
            </SelectComponent>
        </FormControl>
    </React.Fragment>
    )
}

export default React.memo(OptionSelectList)