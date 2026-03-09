import mongoose,{Schema} from "mongoose";

const attendanceSchema=new Schema({
   user:{
    type:Schema.Types.ObjectId,
    ref:"User",
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
    enum:["Present","Absent","Late","Half-day"],
    default:"Present"
   },

   subjectCode:{
      type:String,
      required:true
   },
   macUsed:{
      type:String,
      default:null
   }
   
},  {timestamps:true});

attendanceSchema.index({user:1,date:1},{unique:true})

const Attendance=mongoose.model("Attendance",attendanceSchema)

export {Attendance}