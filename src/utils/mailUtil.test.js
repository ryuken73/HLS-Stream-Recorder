const mailUtil = require('./mailUtil');

const wiseMail = mailUtil.connect({host:'10.10.16.77'});
const date = new Date();
const mailOptions = {
    from: 'ELK capture ryuken01@sbs.co.kr',
    to: 'ryuken01@sbs.co.kr',
    subject: `[${date.toLocaleDateString()}]Daily ELK Report`,
    html: 'From ELK',
    // attachments: [
    //     'D:/002.Code/002.node/workspaces/projects/lab/test.puppeteer/kbs_cctv_1616562659778.jpg',
    //     'D:/002.Code/002.node/workspaces/projects/lab/test.puppeteer/kbs_cctv_1616563698964.jpg'
    // ]
}
wiseMail.send(mailOptions);