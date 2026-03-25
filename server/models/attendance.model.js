import mongoose,{Schema} from "mongoose";

const attendanceSchema=new Schema({
   user:{
    type:Schema.Types.ObjectId,
    ref:"User",
    required:true
   },

   lecture:{
      type:Schema.Types.ObjectId,
      ref:"Lecture",
      required:true
   },

   subject:{
      type:Schema.Types.ObjectId,
      ref:"Subjects",
      required:true
   },

   date:{
    type:String,
    required:true
   },

   checkIn:{
    type:Date,
    default:null
   },

   checkOut:{
    type:Date,
    default:null
   },

   status:{
    type:String,
    enum:["Present","Absent","Late","Session_Started","Session_Ended"],
    default:"Present"
   },

   

   capturedFace:{
      type:String,
      required:function(){
         return this.status==="Present"
      }
   }
  
   
},  {timestamps:true});

attendanceSchema.index({user:1,lecture:1,unique:1})

attendanceSchema.index({lecture:1,status:1})

const Attendance=mongoose.model("Attendance",attendanceSchema)

export {Attendance}