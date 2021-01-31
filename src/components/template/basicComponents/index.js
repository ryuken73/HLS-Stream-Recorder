import styled from 'styled-components';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import deepPurple from '@material-ui/core/colors/deepPurple';
import teal from '@material-ui/core/colors/teal';
import blueGrey from '@material-ui/core/colors/blueGrey';
import Tooltip from '@material-ui/core/Tooltip';


const defaultBgColor = deepPurple[800];
const defaultFontColor = 'white';

const BasicButton  = styled(Button)`
    margin-top: ${props => props.mt || "2px"};
    margin-bottom: ${props => props.mb || "2px"};
    margin-left: ${props => props.ml || "5px"};
    margin-right: ${props => props.mr || "5px"};
    font-size: ${props => props.fontSize || "11px"};
    padding-top: ${props => props.pt || "10px"};
    padding-bottom: ${props => props.pb || "10px"};
    padding-left: ${props => props.pl || "20px"};
    padding-right: ${props => props.pr || "20px"};
    background: ${props => props.bgcolor || defaultBgColor};
    height: ${props => props.height};
    min-width: ${props => props.minwidth};
    width: ${props => props.width};
    &:disabled {
        color: darkgreen;
    }
`

const BasicSelect = styled(Select)`
    .MuiSelect-root {
        padding-top: ${props => props.pt || "12px"};
        padding-bottom: ${props => props.pb || "12px"};
        background: ${props => props.bgcolor || defaultBgColor};
        color: ${props => props.fontcolor || defaultFontColor};
        font-size: ${props => props.fontSize || '13px'}
    }
`

const BasicLink = styled(Link)`
    &.MuiTypography-colorPrimary {
        color: ${props => deepPurple[props] || blueGrey[100]};
    }
`

const BasicIconButton = styled(IconButton)`
    padding: ${props => props.padding || "5px"};
    .MuiIconButton-label {
        .MuiSvgIcon-root {
            color: ${props => props.iconcolor || 'white'};
        }
    }
`

// const BasicIconButtonWithTooltip = tooltipProps => iconButtonProps => props => {
//     const {children} = props;
//     return <Tooltip {...tooltipProps}>
//                 <Box>
//                     <BasicIconButton {...iconButtonProps}>
//                         {children}
//                     </BasicIconButton>
//                 </Box>
//     </Tooltip>
// }

export {
    BasicButton,
    BasicSelect,
    BasicLink,
    BasicIconButton,
    // BasicIconButtonWithTooltip
}