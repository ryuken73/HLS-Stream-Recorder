const {
    getFileCountR,
    getDirectoryCountR,
    getTotalSizeR,
    getDirListR,
    getFileListR
} = require('./fp.file_commonjs');

const TEST_DIR = 'd:/temp/cctv';
const main = async (dir) => {
    console.log(await getFileCountR(dir));
    console.log(await getDirectoryCountR(dir));
    console.log(await getTotalSizeR(dir));
    console.log(await getDirListR(dir));
    console.log(await getFileListR(dir));
}

main(TEST_DIR)

