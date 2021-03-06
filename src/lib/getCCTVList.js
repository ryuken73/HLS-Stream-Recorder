const electronUtil = require('./electronUtil');
const path = require('path');
import {encryptUrl} from './encryptUrl';
import {order} from '../utils';

const distinctByKey = (arrayObject, key) => {
    const resultsUniq = [];
    arrayObject.forEach(objectElement => {
        const isUnique = resultsUniq.every(resultElement => resultElement[key] !== objectElement[key]);
        if(isUnique) resultsUniq.push(objectElement);
    })
    return resultsUniq;
}

export const cctvFromConfig = () => {
    const defaultJsonFile = electronUtil.getAbsolutePath('config/default/sources.json', true);
    const customJsonFile = electronUtil.getAbsolutePath('config/sources.json', true);
    const defaultJson = electronUtil.readJSONFile(defaultJsonFile);
    const customJson = customJsonFile === false ? {sources:[]} : electronUtil.readJSONFile(customJsonFile);
    const mergedButDefaultFirst = distinctByKey([...defaultJson.sources, ...customJson.sources], 'title');
    // const urlEncrypted = [...mergedButDefaultFirst].map(source => {
    //     if(source.url){
    //         return {...source}
    //     }
    //     // const uri = encryptUrl(source.cctvId);
    //     // const completeUrl = `${cctvHost}/${source.cctvId}/${uri}`;
    //     const completeUrl = encryptUrl(cctvHost, source.cctvId);
    //     return {...source, url: completeUrl}
    // })
    const orderByTitle = mergedButDefaultFirst.sort(order.orderByKey('title'));
    return orderByTitle;
}

