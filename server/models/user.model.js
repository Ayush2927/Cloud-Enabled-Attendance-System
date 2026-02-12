import mongoose from "mongoose";
import Jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const UserSchema=new mongoose.Schema({
    timestamps:true

},

{
    name:{
        type:String,
        required:true
    },

    email:{
        type:String,
        required:true,
        unique:true
    },

    password:{
        type:String,
        required:true
    },

    refreshToken:{
       type:String
    },

    role:{
        type:String,
        enum:[Teacher,Student,Admin],
        default:"Student"
    }


})


//password hashing middleware
UserSchema.methods.pre("save", async function(){
    //only has if password changed
    if(!this.isModified("password")){
        return;
    }

    this.password=await bcrypt.hash(this.password,10)

})

//password comparison method
UserSchema.methods.isPasswordCorrect=async function(){
    return await bcrypt.compare(password,this.password)
}


UserSchema.methods.generateAccessToken=function(){
    return Jwt.sign({
        _id:this._id,
        email:this.email,
        role:this.role
},
     process.env.JWT_SECRET,
     {
        expiresIn:"15m"
     }
)
}

UserSchema.methods.generateRefreshToken=function(){
    Jwt.sign({
        _id:this._id
    },
     process.env.JWT_secret,
     {
        expiresIn:"7d"
     }
)
}

const User=mongoose.model("User",UserSchema);

export {User}