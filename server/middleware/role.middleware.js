
import { ApiError } from "../utils/ApiError.js";

const authorizeRoles= (...allowedRoles)=>{
    return (req,res,next)=>{
        if(!req.user || !req.user.role){
            throw new ApiError(401,"User not authenticated, login first")
        }

        if(!allowedRoles.includes(req.user.role)){
            throw new ApiError(403,`Access denied. Your role ${req.user.role} does not have permission to do this`)
        }
        next();
    }
}

export {authorizeRoles};

