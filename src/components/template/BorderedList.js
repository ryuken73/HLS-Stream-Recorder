import React from 'react';
import BorderdBox from './BorderedBox';

export default function BorderedList(props) {
    const {subject, titlewidth="20%", content, hidden=false} = props;
    const {alignItems="center", color="deepskyblue", bgcolor="midnightblue", border=1} = props;

    return (
        <BorderdBox 
            display={hidden ? "none" : "flex"} 
            alignItems={alignItems} 
            bgcolor={bgcolor} 
            border={border} 
            {...props
        }>
            <BorderdBox border={0} width={titlewidth} bgcolor={bgcolor} color={color}>
                {subject}
            </BorderdBox>
            <BorderdBox border={0} flex={1} display="flex" alignItems="center" bgcolor={bgcolor}>
                {content}
            </BorderdBox>
        </BorderdBox>
    )
}
  