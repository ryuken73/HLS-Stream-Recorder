import React from 'react';
import OptionSelectList from '../template/OptionSelectList';
import {encryptUrl, decryptUrl} from '../../lib/encryptUrl';

const createdBefore = (createdDateString, milliSeconds) => {
    const createdDate = new Date(createdDateString);
    const createTimestamp = createdDate.getTime();
    console.log('### createdDate:', createdDate)
    return (Date.now() - createTimestamp) > milliSeconds;
}

const URL_REFRESH_MILLI_SECONDS = 60 * 1000;

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
    const {savePlayerHttpURL=()=>{}} = props.HLSRecordersActions;
    const {refreshSourceUrl=()=>{}} = props.AppActions;
    
    const currentUrl = source.url;
    // console.log('cctvId', source);
    const inRecording = recorderStatus !== 'stopped';
    const selectItems = sources.map(source => {
        return {
            value: source.url,
            label: source.title
        }
    })

    const onChangeSelect = React.useCallback((event) => {
        const currentUrl = event.target.value;
        const decrypted = decryptUrl(currentUrl);
        const [corname, svcname, cctvId, createdDateString] = decrypted.split(',');
        const url = createdBefore(createdDateString, URL_REFRESH_MILLI_SECONDS) ?
                    encryptUrl(cctvHost, cctvId) : currentUrl
        console.log('currentUrl : url : cctvId ;', currentUrl, url, cctvId)
        setSourceNSave({channelNumber, cctvId, url});
        savePlayerHttpURL({channelNumber, playerHttpURL:url});
        setPlayerMount({channelNumber, mountPlayer:true})
    }, [setSourceNSave])

    return (
        <OptionSelectList 
            hidden={hidden}
            subtitle='source'
            titlewidth={"80px"}
            minWidth='200px'
            maxWidth='216px'
            currentItem={currentUrl}
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