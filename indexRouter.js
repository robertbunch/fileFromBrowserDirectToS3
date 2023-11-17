const express = require('express')
const router = express.Router()
const mime = require('mime-types')
const getS3PutLink = require('./getS3PutLink')

router.post('/upload-file',async(req, res)=>{
    //this route's job is to take the filename and get a link
    //from S3 that would allow the browser to upload
    //you may need it to validate the user, or confirm the upload is allowed
    //in the real world... this is probably good to gate...
    const { fileName, fileSize } = req.body
    //make a key that will be unique in our bucket
    const uniqueS3key = `${Date.now().toString()}-${encodeURIComponent(fileName)}}`
    //mimeType is REQUIRED by aws
    const mimeType = mime.lookup(fileName)
    //we use our function getS3PutLink to create our link to send to the browser
    const s3ResponseLink = await getS3PutLink(uniqueS3key,mimeType)
    //Express now waits. The browser talks directly to S3
    res.json({
        s3ResponseLink,
        mimeType,
        uniqueS3key
    })
})

router.get('/test',(req, res)=>{
    res.json("Test")
})

module.exports = router