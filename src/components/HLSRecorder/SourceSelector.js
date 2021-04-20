import React from 'react';
import OptionSelectList from '../template/OptionSelectList';
import {getEncryptedUrl} from '../../lib/urlUtils';

function Selection(props) {
    const {
        channelNumber=1,
        cctvHost,
        source={}, 
        sources=[], 
        recorderStatus='stopped',
        hidden=false
    } = props;
    const {
        setSourceNSave=()=>{},
        setPlayerMount=()=>{}
    } = props.HLSPlayersActions;
    // const {savePlayerHttpURL=()=>{}} = props.HLSRecordersActions;
    const {refreshSourceUrl=()=>{}} = props.AppActions;
    
    const currentId = source.cctvId;
    console.log('re-render selection:', source);
    const inRecording = recorderStatus !== 'stopped';
    const selectItems = sources.map(source => {
        return {
            value: source.cctvId,
            label: source.title,
        }
    })

    const onChangeSelect = React.useCallback((event) => {
        console.log(event.target)
        const cctvId = event.target.value;
        const url = getEncryptedUrl(cctvId);
        setSourceNSave({channelNumber, cctvId, url});
        // savePlayerHttpURL({channelNumber, playerHttpURL:url});
        setPlayerMount({channelNumber, mountPlayer:true})
    }, [setSourceNSave])

    return (
        <OptionSelectList 
            hidden={hidden}
            subtitle='source'
            titlewidth={"80px"}
            minWidth='200px'
            maxWidth='216px'
            currentItem={currentId}
            multiple={false}
            menuItems={selectItems}
            onChangeSelect={onChangeSelect} 
            smallComponent={true}
            bgcolor={'#232738'}
            selectColor={"#2d2f3b"}
            disabled={inRecording}
            mb={"2px"}
        ></OptionSelectList>
    )
}

export default React.memo(Selection)