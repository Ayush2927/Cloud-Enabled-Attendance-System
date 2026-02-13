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
    
    const studentId=req.user._id;
    console.log(" Student ID:", studentId);

    const today=new Date().toISOString().split('T')[0];
    console.log(" Today's date:", today);

    const existingRecord=await Attendance.findOne({
        user:studentId,
        date:today
    })
    console.log(" Existing record found:", existingRecord ? "Yes" : "No");

    if(existingRecord){
        throw new ApiError(400,"Attendance has been marked for today");
    }

    console.log(" Creating new attendance record");
    
    const record=await Attendance.create({
       user:studentId,
       date:today
    });

    const recordWithIST = {
        ...record._doc,
        markedAtIST: formatToIST(record.createdAt)
    };
    
    console.log(" Record created:", record);

    return res.status(201)
    .json(new ApiResponse(201,recordWithIST,"Student attendance marked successfully"))
})


//teacher logic

const logTeacherShift=asyncHandler(async(req,res,next)=>{
    const teacherId=req.user._id;
    const today=new Date().toISOString().split('T')[0];

    let record=await Attendance.findOne({
        user:teacherId,
        date:today
    }) 

    if(!record){
        record=await Attendance.create({
            user:teacherId,
            date:today,
            checkIn:new Date(),
            STATUS:"Present"
        })

        const recordWithIST = {
            ...record._doc,
            checkInIST: formatToIST(record.checkIn)
        };
    
        return res.status(201)
        .json(new ApiResponse(201,recordWithIST,"Teacher check in successful"))
    }

    if(record.checkOut){
        throw new ApiError(400,"You have already checked out for today")
    }

    //update existing record with checkout time
    record.checkOut=new Date();
    await record.save();

    const recordWithIST = {
        ...record._doc,
        checkInIST: formatToIST(record.checkIn),
        checkOutIST: formatToIST(record.checkOut)
    };

    return res.status(200)
    .json(new ApiResponse(200,recordWithIST,"Teacher check out successful"))


    
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
    // 1. Fetch all records and 'populate' user info so we see Names, not just IDs
    const allLogs = await Attendance.find()
        .populate("user", "name role email")
        .sort({ createdAt: -1 }); // Show the most recent activity first

    // 2. Transform the array to include IST strings for every entry
    const logsWithIST = allLogs.map(log => {
        // We extract the plain data from the Mongoose document
        const logData = log._doc;

        return {
            ...logData,
            // Add IST formatted strings for the Admin report
            dateIST: formatToIST(log.createdAt),
            checkInIST: log.checkIn ? formatToIST(log.checkIn) : "N/A",
            checkOutIST: log.checkOut ? formatToIST(log.checkOut) : 
                         (log.user?.role === "Teacher" ? "Still on Shift" : "N/A")
        };
    });

    // 3. Send the fully formatted list back to the Admin
    return res.status(200).json(
        new ApiResponse(200, logsWithIST, "All attendance logs retrieved successfully in IST")
    );
});


export {markStudentAttendance,logTeacherShift,getAdminReports};