import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import Jwt from "jsonwebtoken";

/*const verifyJwt=asyncHandler(async(req,res,next)=>{
   try {
     const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
 
     if(!token){
         throw new ApiError(401,"Unauthorized request")
     }
 
     const decodedToken=Jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
 
    if(!user){
     throw new ApiError(401,"Invalid access token")
    }
    req.user=user;
    next();
   } catch (error) {
    throw new ApiError(401,error?.message || "Invalid access token")
    
   }
}) */

   const verifyJwt=asyncHandler(async(req,res,next)=>{
   try {
     console.log(" Middleware called"); 
     const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
     
     console.log(" Token:", token ? "Found" : "Not found"); 
 
     if(!token){
         throw new ApiError(401,"Unauthorized request")
     }
 
     const decodedToken=Jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
     console.log("Token verified"); 
     
    const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
 
    if(!user){
     throw new ApiError(401,"Invalid access token")
    }
    console.log("User found:", user.email); 
    req.user=user;
    next();
   } catch (error) {
    console.error(" Auth error:", error.message); 
    throw new ApiError(401,error?.message || "Invalid access token")
   }
})


export {verifyJwt}