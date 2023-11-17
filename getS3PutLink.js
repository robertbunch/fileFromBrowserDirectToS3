//aws is the sdk for node doing aws stuff
const aws = require('aws-sdk')
//creds are our credentials for aws
const creds = require('./config')

aws.config.update({
    accessKeyId: creds.accessKey,
    secretAccessKey: creds.secretAccessKey,
    region: creds.region,
    signatureVersion: creds.signatureVersion,
})

const getS3PutLink = (uniqueS3key,mimeType,bucketName = creds.bucketName)=>{
    return new Promise((resolve, reject)=>{
        // console.log(uniqueS3key,mimeType,bucketName)
        const options = {
            bucket: bucketName,
            region: creds.region,
            signatureVersion: creds.signatureVersion,
            signatureExpires: 60, //number of seconds the link is valid for (default 60)
            ACL: 'private', //private is default
            uniquePrefix: true, //should s3 force the key to be unique
        }
        //create an s3 object from the aws S3 class
        const s3 = new aws.S3(options)
        const params = {
            Bucket: creds.bucketName,
            Key: uniqueS3key,
            Expires: 60,
            ContentType: mimeType,
            ACL: 'private',
        }
        s3.getSignedUrl('putObject',params,(error,data)=>{
            if(error)throw error
            resolve(data) //the data is the put link
        })
    })
}

module.exports = getS3PutLink