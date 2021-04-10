const utils = require('./index_commonjs.js');
const {getDirListR} = utils.file;
const main = async dir => {
    const list = await getDirListR(dir);
    console.log(list)
}

main('d:/temp/cctv')