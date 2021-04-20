import {encryptUrl, decryptUrl} from './encryptUrl';

const {getCombinedConfig} = require('./getConfig');
const config = getCombinedConfig({storeName:'optionStore', electronPath:'home'});
const {
    CCTV_HOST,
} = config;

export const getEncryptedUrl = cctvId => {
    return encryptUrl(CCTV_HOST, cctvId)
}