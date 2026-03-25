
import mongoose, { Schema } from "mongoose";
import { Subject } from "./subject.model";

const lectureSchema=new Schema({

        subject:{
            type: Schema.Types.ObjectId,
            ref:"Subject",
            required:true
        },

        teacher:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true
        },

        division:{
            type:String,
            required:true,
            trim:true,
            uppercase:true
        },

        date:{
            type:String,
            required:true
        },

        lectureNumber:{
            type:Number,
            required:true
        },

        startTime:{
            type:String,
            required:true
        },

        endTime:{
            type:String,
            required:true
        },

        sessionStatus:{
          type:String,
          enum:["Scheduled","Active","Ended"],
          default:"Scheduled"
        },

        sessionStartedAt:{
          type:Date,
          default:null
        },

        sessionEndedAt:{
            type:Date,
            default:null
        }
    }, {timestamps:true})

//All lectures for CSBS-I today
    lectureSchema.index({date:1,division:1});

    //Is there an active session for this subject today
    lectureSchema.index({subject:1,date:1,sessionStatus:1});

    const Lecture=mongoose.model("Lecture",lectureSchema);
    export {Lecture}

