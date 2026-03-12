import { Attendance } from "../models/attendance.model.js";
import Jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { formatToIST } from "../utils/timeUtils.js";

/* const markStudentAttendance=asyncHandler(async(req,res,next)=>{
    const studentId=req.user._id;

    const today=new Date().toISOString().split('T')[0];

    const existingRecord=await Attendance.findOne({
        user:studentId,
        date:today
    })

    if(existingRecord){
        throw new ApiError(400,"Attendance has been marked for today");
    }

    const record=await Attendance.create({
       user:studentId,
       date:today
    });

    return res.status(201)
    .json(new ApiResponse(201,record,"Student attendance marked successfully"))
}) */

    const markStudentAttendance=asyncHandler(async(req,res,next)=>{
    console.log(" markStudentAttendance called");
    
    const {subjectCode,liveFaceImage}=req.body
    const studentId=req.user._id;
    console.log(" Student ID:", studentId);

    if(!subjectCode || !liveFaceImage){
        throw new ApiError(400, "SubjectCode and Face Capture are required")
    }
    
    const isFaceValid=liveFaceImage.length>1000;

    if(!isFaceValid){
        throw new ApiError(401,"Biometric verification failed, No clear face detected")
    }
    const activeSession =await Attendance.findOne({
        subjectCode,
        status:"Session_Started",
        checkOut:null,
        createdAt:{$gte:new Date(Date.now()-15*60000)}
    })

    if(!activeSession){
        throw new ApiError(400,"Currently no active session found for this subject")
    }

    const today=new Date().toISOString().split('T')[0];
    console.log(" Today's date:", today);

    const existingRecord=await Attendance.findOne({
        user:studentId,
        date:today,
        subjectCode,
        status:"Present"
    })
    console.log(" Existing record found:", existingRecord ? "Yes" : "No");

    if(existingRecord){
        throw new ApiError(400,"Attendance already recorded for this lecture");
    }

    console.log(" Creating new attendance record");
    
    const record=await Attendance.create({
       user:studentId,
       date:today,
       subjectCode, 
       status:"Present",
       capturedFace:liveFaceImage
    });

    const recordWithIST = {
        ...record._doc,
        markedAtIST: formatToIST(record.createdAt)
    };
    
    console.log(" Record created:", record);

    return res.status(201)
    .json(new ApiResponse(201,recordWithIST,"Student attendance marked successfully"))
})


//teacher logic-log shift and open session

const logTeacherShift=asyncHandler(async(req,res,next)=>{
    const {subjectCode}=req.body;
    const teacherId=req.user._id;
 
    const user=User.findById(teacherId);

    if(!subjectCode){
        throw new ApiError(400,"SubjectCode is required to start the session");
    };

    

    const today=new Date().toISOString().split('T')[0];

    let record=await Attendance.findOne({
        user:teacherId,
        date:today,
        subjectCode
    }) 

    if(!record){
        record=await Attendance.create({
            user:teacherId,
            date:today,
            subjectCode,
            checkIn:new Date(),
            status:"Session_Started"
        })

        const recordWithIST = {
            ...record._doc,
            checkInIST: formatToIST(record.checkIn)
        };
    
        return res.status(201)
        .json(new ApiResponse(201,recordWithIST,"Teacher Session Started Successfully"))
    }

    if(record.checkOut){
        throw new ApiError(400,"You have already ended the session")
    }

    //update existing record with checkout time
    record.checkOut=new Date();
    record.status="Session_Ended"
    await record.save();

    const recordWithIST = {
        ...record._doc,
        checkInIST: formatToIST(record.checkIn),
        checkOutIST: formatToIST(record.checkOut)
    };

    return res.status(200)
    .json(new ApiResponse(200,recordWithIST,"Teacher session ended successfully"))


    
})


 /*const getAdminReports=asyncHandler(async(req,res,next)=>{
    const logs=await Attendance.find()
    .populate("user","name email role")
    .sort({createdAt:-1});

    if(!logs || logs.length===0){
        throw new ApiError(404,"No attendance records found")
    }

    return res.status(200)
    .json(new ApiResponse(200,logs,"All attendance records retrieved"));
})
*/

 const getAdminReports = asyncHandler(async (req, res) => {
    //  Fetch all records and 'populate' user info so we see Names, not just IDs
    const allLogs = await Attendance.find()
        .populate("user", "name role email")
        .sort({ createdAt: -1 }); // Show the most recent activity first

    //  Transform the array to include IST strings for every entry
    const logsWithIST = allLogs.map(log => {
        // We extract the plain data from the Mongoose document
        const logData = log._doc;

        return {
            ...logData,
            // Add IST formatted strings for the Admin report
            dateIST: formatToIST(log.createdAt),
            checkInIST: log.checkIn ? formatToIST(log.checkIn) : "N/A",
            checkOutIST: log.checkOut ? formatToIST(log.checkOut) : 
                         (log.status === "Session_Started" ? "Active Session" : "N/A"),
            hasFaceProof:!!log.capturedFace
        };
    });

    //  Send the fully formatted list back to the Admin
    return res.status(200).json(
        new ApiResponse(200, logsWithIST, "All attendance logs retrieved successfully in IST")
    );
});


const getStoredFace= asyncHandler(async(req,res)=>{
    const user=await User.findById(req.user._id).select("faceData");

    if(!user || !user.faceData){
        throw new ApiError(404,"Biometric reference not found. Please register your face first")
    }

    return res.status(200).json(
        new ApiResponse(200,{faceData:user.faceData},"Reference face fetched successfully")
    )
})

export {markStudentAttendance,logTeacherShift,getAdminReports,getStoredFace};