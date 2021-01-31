import styled from 'styled-components';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import deepPurple from '@material-ui/core/colors/deepPurple';

const defaultBgColor = deepPurple[800];
const defaultFontColor = 'white';

const SmallPaddingIconButton = styled(IconButton)`
    padding: ${props => props.padding || "5px"};
    .MuiIconButton-label {
        .MuiSvgIcon-root {
            color: ${props => props.iconcolor || 'white'};
        }
    }
`
const SmallButton  = styled(Button)`
    margin-top: ${props => props.mt || "2px"};
    margin-bottom: ${props => props.mb || "2px"};
    margin-left: ${props => props.ml || "5px"};
    margin-right: ${props => props.mr || "5px"};
    font-size: ${props => props.fontSize || "11px"};
    padding-top: ${props => props.pt || "2px"};
    padding-bottom: ${props => props.pb || "2px"};
    padding-left: ${props => props.pl || "10px"};
    padding-right: ${props => props.pr || "10px"};
    background: ${props => props.bgcolor || defaultBgColor};
    height: ${props => props.height};
    min-width: ${props => props.minwidth};
    &:disabled {
        color: darkgreen;
    }
`

const SmallMarginTextField = styled(TextField)`
    margin-top: ${props => props.mt || "2px"};
    margin-bottom: ${props => props.mb || "2px"};
    margin-left: ${props => props.ml || "0px"};
    background: ${props => props.bgcolor || defaultBgColor};
    width: ${props => props.width || "100%"};
    height: ${props => props.height || "100%"};
    .MuiInputBase-input {
        padding-top: ${props => props.pt || "5px"};
        padding-bottom: ${props => props.pb || "5px"};
        color: ${props => props.textColor || defaultFontColor};
        font-size: ${props => props.fontSize || ""};
        text-align: ${props => props.textalign || "center"};
        width: ${props => props.width || "100%"};
    }
    .MuiOutlinedInput-root {
        border-radius: 0px;
    }    
`

const SmallPaddingFormControlLabel = styled(FormControlLabel)`
    .MuiRadio-root {
        padding-top: 1px;
        padding-bottom: 1px;
        padding-left: 9px;
        padding-right: 5px;
        
    }
`
const SmallPaddingSelect = styled(Select)`
    .MuiSelect-root {
        padding-top: ${props => props.pt || "5px"};
        padding-bottom: ${props => props.pb || "5px"};
        background: ${props => props.bgcolor || defaultBgColor};
        color: ${defaultFontColor};
    }
`
export {
    SmallPaddingIconButton,
    SmallMarginTextField,
    SmallPaddingFormControlLabel,
    SmallPaddingSelect,
    SmallButton,    
}