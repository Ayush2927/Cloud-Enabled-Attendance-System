import mongoose, { Schema } from "mongoose";


const subjectSchema=new Schema({
    code:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        uppercase:true
    },

    name:{
        type:String,
        required:true,
        trim:true

    },

    teachers:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},
{timestamps:true});

const Subject=mongoose.model("Subject",subjectSchema);
export {Subject};