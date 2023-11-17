const config = require('./config')
const creds = require('./config')
const aws = require('aws-sdk');

aws.config.update(creds);
const s3 = new aws.S3({})


function getSignedLink(key,bucket = creds.bucketName){
    if(key){ 
        const signedUrlExpireSeconds = 60 * 60 //expire in 60 minutes

        const url = s3.getSignedUrl('getObject', {
            Bucket: bucket,
            Key: key,
            Expires: signedUrlExpireSeconds
        })
        return url;
    }else{
        return "";
    }
}

module.exports = getSignedLink



