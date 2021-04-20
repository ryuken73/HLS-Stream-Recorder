const crypto = require('crypto');
const utils = require('../utils');

const encrypt = (str, key) => {
    const cipher = crypto.createCipheriv('aes-128-ecb', key, null);
    let crypted = cipher.update(str, 'utf-8', 'base64');
    crypted += cipher.final('base64');
    return crypted;
}

const decrypt = (encrypted, key) => {
    const decipher = crypto.createDecipheriv('aes-128-ecb', key, null);
    let decrypted = decipher.update(encrypted, 'base64', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
}

export const encryptUrl = (cctvHost, cctvId) => {
    try {
        const CORNAME = 'sbs';
        const SVCNAME = 'sbscctv';
        const TIME = utils.date.getString(new Date(),{dateSep:'-', timeSep:':', sep:" "});
        const cryptoString = `${CORNAME},${SVCNAME}live,${cctvId},${TIME}`;
        const keyString = `TNM${cctvId.toString().padStart(8,'0')}KTICT`;
        const encryptedUrl = encrypt(cryptoString, keyString);
        return `${cctvHost}/${cctvId}/${encryptedUrl}`;
    } catch (err) {
        console.error(err)
        return 'fail';
    }
}

export const decryptUrl = hlsUrl => {
    try {
        const grepEncrypted = /.*\/(\d{4})\/(.*)/g;
        const [url, cctvId, uriEncrypted] = grepEncrypted.exec(hlsUrl);
        // console.log('cctvId and uriEncrpted:', cctvId, uriEncrypted);
        const keyString = `TNM${cctvId.toString().padStart(8,'0')}KTICT`;
        const decrypted = decrypt(uriEncrypted, keyString);
        console.log('decrypted:', decrypted);
        return decrypted;

    } catch (err) {
        console.error(err);
    }
}