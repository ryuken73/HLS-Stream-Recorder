const nodemailer = require('nodemailer');
const path = require('path');

const mkAttachmentOpt = options => {
    const {attachments} = options;
    return attachments.map((filename, index) => {    
        const basename = path.basename(filename);    
        return {
            filename: basename,
            path: filename,
            cid: `${index}`
        }
    })
}

const mkHtmlOpt = options => {
    const {html, attachments} = options;
    const additionalHtml = attachments.reduce((htmlForAttachments, path, index) => {
        const htmlForAttachment = htmlTemplate(path, index);
        return htmlForAttachments + htmlForAttachment;
    },"");
    return `${html}\n${additionalHtml}`;
}

const htmlTemplate = (filename, index) => {
    return `
        ${filename}
        <img style="width:100%" src="cid:${index}"/>

    `
}

const genFunc = {
    'attachment': mkAttachmentOpt,
    'html': mkHtmlOpt
}

const generateOption = (type, options) => {
    return genFunc[type](options)
}

const mailUtil = {
    connect(options){
        const defaultOptions = {
            host: '10.10.16.77',
            port: 25,
            secure: false,
            auth: {}
        }
        let optionMerged;
        if(typeof(options) === 'object'){
            optionMerged = {
                ...defaultOptions,
                ...options
            }
        }
        if(typeof(options) === 'string'){
            const smtpAddress = options;
            optionMerged = {
                ...defaultOptions,
                host: smtpAddress
            }
        }
        this.connection = nodemailer.createTransport(optionMerged); 
        return this
    },
    setDefaultOptions(options){
        this.defaultOptions = options;
    },
    async send(options){
        return new Promise((resolve, reject) => {
            const {
                from,
                to,
                subject,
                text,
                html,
                attachments=[]
            } = options;
            let modifiedOptions = {...this.defaultOptions, ...options};
            if(attachments.length > 0){
                const attachmentsForNodeMailer = generateOption('attachment', {attachments});
                const htmlForNodeMailer = generateOption('html', {html, attachments});
                modifiedOptions = {
                    ...options,
                    html: htmlForNodeMailer,
                    attachments: attachmentsForNodeMailer
                } 
            }
            console.log(modifiedOptions);
            this.connection.sendMail(modifiedOptions, (err, result) => {
                if(err){
                    return reject(err);
                }
                console.log('Mail sent successfully');
                resolve(result);
            })
        })
    }
}

export default mailUtil;