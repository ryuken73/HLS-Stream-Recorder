import React from 'react'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import {SmallPaddingIconButton}  from '../../template/smallComponents';

function RecordButton(props) {
    const {disabled, iconcolor, onClickRecordButton} = props;
    return (
        <SmallPaddingIconButton disabled={disabled} padding="1px" size="small" iconcolor={iconcolor}>
            <FiberManualRecordIcon 
                fontSize={"small"} 
                onClick={onClickRecordButton}
            ></FiberManualRecordIcon>
        </SmallPaddingIconButton>
    )
}

export default React.memo(RecordButton);
