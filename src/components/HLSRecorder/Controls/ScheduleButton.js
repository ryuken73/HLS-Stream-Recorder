import React from 'react'
import AccessAlarmIcon from '@material-ui/icons/AccessAlarm';
import {SmallPaddingIconButton}  from '../../template/smallComponents';

function ScheduleButton(props) {
    const {disabled, iconcolor, onClickScheduleButton} = props;
    return (
        <SmallPaddingIconButton 
            disabled={disabled} 
            padding="1px" 
            size="small" 
            iconcolor={iconcolor}
            onClick={onClickScheduleButton}
        >
            <AccessAlarmIcon 
                fontSize={"small"} 
            ></AccessAlarmIcon>
        </SmallPaddingIconButton>
    )
}

export default React.memo(ScheduleButton);
