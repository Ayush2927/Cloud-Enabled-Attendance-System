import * as faceapi from "face-api.js";


const loadModels= async()=>{
    try {
        const MODEL_URL='/models';
    
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        console.log("AI models loaded successfully");
    } catch (error) {
        console.error("Error loading AI models",error)
        
    }
};

//Comparison Logic
const getFaceMatch=async(storedBase64,liveWebcamElement)=>{

    const referenceImage=await faceapi.fetchImage(storedBase64);

    //GET THE MATH FINGERPRINT OF REFERENCE FACE
    const refResult=await faceapi.detectSingleFace(
        referenceImage,
        new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();

        if(!refResult){
            return null;
        }

    //create a facematcher to compare live frames against this reference image
    const faceMatcher=new faceapi.FaceMatcher(refResult);

    //get the descriptor(math fingerprint) of the person in the live webcam
    const liveResult= await faceapi.detectSingleFace(
        liveWebcamElement,
        new faceapi.TinyFaceDetectorOptions()
    ).withFaceLandmarks().withFaceDescriptor();
    
    if(liveResult){
        //compare them, result.distance<0.6 usually means its the same person
        const match=faceMatcher.findBestMatch(liveResult.descriptor);
        return match;
    }
    
    return null;
}


export{loadModels,getFaceMatch}