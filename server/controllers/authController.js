import Jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError,asyncHandler,ApiResponse } from "../utils/ApiError.js";


const generateAccessAndRefreshTokens= async(userId)=>{
    try{
        const user=await User.findById(userId);

        if(!user){
            throw new ApiError(404,"User not found")
        }

        const accessToken=user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();

        user.refreshToken=refreshToken;

    await user.save({validateBeforeSve:false});

    return {accessToken,refreshToken};
    }

    catch(error){
        throw new ApiError(500,"error generating tokens")

    }
}

const registerUser= asyncHandler(async(req,res)=>{
    //get user data from request body
    const {email,name,role,password}=req.body;
    //validate input fields(check missing values)
    if(!email || !password || !name){
        throw new ApiError(400,"All fields are required")
    }
    //check if user already  exists in database

    const ExistingUser= await User.findOne({email});

    if(ExistingUser){
        throw new ApiError(409,"User with these credentials already exist");
    }
    
    //create new user object
    const user=await User.create({
        name,
        email,
        password,
        role
    })


    //remove sensitive fields
const createdUser=await User.findById(user._id).select( "-password -refreshToken");

    //send a success response

    return res.status(201)
    .json(new ApiResponse(201,createdUser,"User registered successfully")); 

    
})


const loginUser=asyncHandler(async(req,res)=>{
    
        //get credentials

        const {email,password}=req.body;

        //check for missing fields

        if(!email || !password){
            throw new ApiError(400,"email and password both are required")
        }

        //find user
        const user=await User.findOne({email})
        if(!user){
            throw new ApiError(404,"User not found");
        }

        //compare password
        const isPasswordValid=await user.isPasswordCorrect(password);
        if(!isPasswordValid){
            throw new ApiError(401,"Invalid password");
        }

        //generate tokens
        const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id);

        //remove sensitive fields
        const loggedInUser=await User.findById(user._id).select("-password -refreshToken");
        
        const options={
            httpOnly:true,
            secure:true
        }

        return res.status(201)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(new ApiResponse(201,{user:loggedInUser,accessToken,refreshToken},"User logged in successfully"));
    })

const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(user._id,{
        refreshToken:null
    });

    const options={
        httpOnly:true,
        secure:true
    }


    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged out"))
})

// used when accessToken expires
const refreshAccessToken=asyncHandler(async(req,res)=>{
        const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken;

        if(!incomingRefreshToken){
            throw new ApiError(401,"unauthorized request");
        }

        //verify refresh token

        try {
            const decodedToken=Jwt.verify(
                incomingRefreshToken,
                process.env.REFRESH_TOKEN_SECRET
            )
    
            const user=await User.findById(decodedToken?._id);
    
            if(!user){
                throw new ApiError(401,"Invalid refresh token")
            }
            
    
            //check if token matches the one stored in db
            if(incomingRefreshToken != user.refreshToken){
                throw new ApiError(401,"refresh token expired or used")
            }
    
            const options={
                httpOnly:true,
                secure:true
            }
    
            const {accessToken,newrefreshToken} =await generateAccessAndRefreshTokens(user._id);
    
             return res.status(200)
       .cookie("accessToken",accessToken)
       .cookie("refreshToken",newrefreshToken)
       .json(
         new ApiResponse(
           200,
           {accessToken,refreshToken: newrefreshToken},
           "access token refreshed"
         )
       )
        } catch (error) {
            throw new ApiError(401,error?.message || "Invalid refresh token")
        }
})


export {registerUser,loginUser,logoutUser,refreshAccessToken}
   ;



