const crypto = require('crypto');
const utils = require('../utils');

const encrypt = (str, key) => {
    const cipher = crypto.createCipheriv('aes-128-ecb', key, null);
    let crypted = cipher.update(str, 'utf-8', 'base64');
    crypted += cipher.final('base64');
    return crypted;
}

export const encryptUrl = cctvId => {
    try {
        const CORNAME = 'sbs';
        const SVCNAME = 'sbscctv';
        const TIME = utils.date.getString(new Date(),{dateSep:'-', timeSep:':', sep:" "});
        const cryptoString = `${CORNAME},${SVCNAME}live,${cctvId},${TIME}`
        const keyString = `TNM${cctvId.toString().padStart(8,'0')}KTICT`
        return encrypt(cryptoString, keyString)
    } catch (err) {
        console.error(err)
        return 'fail';
    }
}