import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) {
            console.log("File path is not correct");
            return null;
        }
        // upload the file on cloudinary 
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        // file has been uploaded succesfully
        // console.log("The file is uploaded on Cloudinary -> ", response.url);

        // console.log("RESPONSE SENT FROM CLOUDINARY: ", response);
        
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath); // remove the locally saved file as the upload failed
        return null;
    }
}



export {uploadOnCloudinary};