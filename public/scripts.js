const progressBar = document.querySelector('.progress-bar')
const progressWrapper = document.querySelector('#progress-wrapper')

const updateProgressBar = progressEvent =>{
    console.log(progressEvent)
    const percentDone = progressEvent.loaded / progressEvent.total;
    const barWidth = Math.floor(percentDone * 100);
    progressBar.style.width = `${barWidth}%`
    progressBar.setAttribute("aria-valuenow", barWidth);
}

const uploadFile = async(e)=>{
    e.preventDefault() //keep the browser from submitting
    // console.log(e)
    //Step 1. Turn on our progress bar
    document.getElementById('progress-wrapper').style.display = "block"
    //Step 2. Get a link from the back-end/express
    const file = e.target[0].files[0]
    //we do NOT want to send the entire file
    //we only want to send the name and the size
    const data = {
        fileName: file.name,
        fileSize: file.size
    }
    const postUrl = `http://localhost:3000/upload-file`
    const uploadInfoResp = await axios.post(postUrl,data)
    console.log(uploadInfoResp.data)
    const uploadInfo = uploadInfoResp.data
    // uploadInfo contains:
    // s3ResponseLink, mimeType, uniqueS3key
    //Step 3 - we have a response from the backend
    //hopefully a link...
    if(!uploadInfo.s3ResponseLink){
        //Express refused us...
        swal({
            title: "Failed to get link",
            icon: "error"
        })
    }
    // Step 4 - Try and send file via link Express provided to S3
    const awsFinalResponse = await new Promise(async(resolve, reject)=>{
        try{
            //send the file to S3
            const config = {}
            //MUST include header or AWS will be unhappy
            config.headers = {
                'content-type' : uploadInfo.mimeType
            }
            config.onUploadProgress = progressEvent => updateProgressBar(progressEvent)
            //aws is expecting a PUT action/http verb
            //send the file ... this was the goal all along! cut express out of the "file" part
            const awsResp = await axios.put(uploadInfo.s3ResponseLink,file,config)
            resolve(awsResp)
        }catch(err){
            console.log(`Error from AWS link: ${err}`)
            swal({
                title: "Error from AWS put",
                icon: "error"
            })
            reject(err)
        }
    })
    console.log(awsFinalResponse)

    //Step 5 - Let Express know what happened (success?)
    const finalizeFileUrl = `http://localhost:3000/finalize-upload`
    const finalData = {
        s3Key: uploadInfo.uniqueS3key,
    }
    if(awsFinalResponse.status !== 200){
        swal({
            title: `There was an unknown error uploading to S3. code: ${awsFinalResponse.status}`,
            icon: "error",
        })
        finalData.success = false;
        axios.post(finalizeFileUrl,finalData);
    }else{
        swal({
            title: `File uploaded`,
            icon: "success",
        })
        finalData.success = true;
        const imageUrlResp = await axios.post(finalizeFileUrl,finalData);
        console.log(imageUrlResp)
        document.getElementById('current-image').innerHTML = `<img src="${imageUrlResp.data}" width="100%" />`
    }
    // STEP 6. All done. Flip the showProgress off.
    progressWrapper.style.display = 'none'
}

document.getElementById('file-form').addEventListener('submit',uploadFile)