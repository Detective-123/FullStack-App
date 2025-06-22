import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend -> DONE
    // validation - if not empty -> DONE
    // check if user already exists: username, email -> DONE
    // check for images, avatars, 
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refreshToken field from response
    // check for user creation - if successful or failed
    // send res


    const {fullname, email, username, password} = req.body;
    // console.log("email: ", email);
    // console.log("REQUEST BODY RESPONSE : ", req.body);

    if(
        [fullname, email, username, password].some((field) => field?.trim() === "") 
    ) {
        throw new ApiError(400, "All fields are compulsary and required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    // can do different checks like first username then email
    if(existedUser) {
        throw new ApiError(409, "User with email or username already Exists");
    }

    // console.log("REQUEST FILES : ", req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );


    if(!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Created Successfullly")
    );

});


export {registerUser}