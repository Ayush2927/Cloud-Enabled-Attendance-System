import { Lecture } from "../models/lecture.model.js";
import { Subject } from "../models/subject.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";


//Admin creates a lecture slot

const createLecture=asyncHandler(async(req,res)=>{
    const {subject,teacher,date,division,startTime,endTime}=req.body;

    if(!subject || !teacher || !date || !division || !startTime || !endTime){
        throw new ApiError(400,"subject,division,date,teacher,start time, end time; all these fields are required ")
    }

    const subjectDoc=await Subject.findById("subject");
    if(!subjectDoc){
        throw new ApiError(404 , "Subject not found")
    }

    const teacherDoc=await User.findById("teacher");
    if(!teacherDoc || !teacherDoc.role){
        throw new ApiError(404, "Teacher not found");
    }

    const isAssigned = subjectDoc.teachers
        .map(t => t.toString())         
        .includes(teacher.toString());

    if(!isAssigned){
        throw new ApiError(403,`${teacherDoc.name} is not assigned to subject ${subjectDoc.code}`);
    }

    const existingCount= await Lecture.countDocuments({subject});

    const lecture=await Lecture.create({
        subject,
        teacher,
        division:division.toUppercase(),
        lectureNumber:existingCount+1,
        startTime,
        endTime,
        date
    })

    const populatedLecture=await lecture.populate([
        {path:"subject",select:"code name"},
        {path:"teacher",select:"name email"}
    ])


    return res.status(201)
    .json(new ApiResponse(201,populatedLecture,"Lecture scheduled successfully"))
})


//All roles: get today's timetable for a division
//called by teacher and student home screen on page load,returns all lectures for that division sorted chronologically
const getTodayTimetable=asyncHandler(async(req,res)=>{
    const {division}=req.query;

    if(!division){
        throw new ApiError(400, "Division Parameter is required")
    }

    const today=new Date().toISOString().split('T')[0];

    const lectures=await Lecture.find({
        divison:division.toUppercase(),
        date:today
    })

    .populate("subject","code name")
    .populate("teacher","name email")
    .sort({startTime:1})


    return res.status(200)
    .json(
        new ApiResponse(200,lectures,`Time table for ${division.toUppercase()} for ${today}`)
    )
})

//Teacher; get their own lectures for today
const getMyTodayLectures=asyncHandler(async(req,res)=>{
    const today=new Date().toISOString().split("T")[0];
    const lectures=await Lecture.find({
        teacher:req.user_id,
        date:today
    })
    .populate("subject","code name")
    .sort({startTime:1})

    return res.status(200).json(
        new ApiResponse(200,lectures,"Your Lectures for today")
    )
})

//Admin: get all lectures with optional filters
//returns every lecture ever scheduled(admin full view)

const getAllLectures=asyncHandler(async(req,res)=>{
    //optional query parameters
  const {subject,division,date}=req.query;

  //start with an empty filter
  //only provide the parameters if the condition is provided
  const filter={}

  if(subject){
    filter.subject=subject;
  }
  if(division){
    filter.division=division.toUppercase()
  }

  if(date){
    filter.date=date
  }

  const lectures=await Lecture.find(filter)
    .populate("subject","code name")  
    .populate("teacher","name email") 
    
    .sort({date:-1,startTime:1})

    return res.status(200).json(
        new ApiResponse(200,lectures,"Lectures retrieved successfully")
    )
  

})

//Admin: Delete a scheduled lecture
//only allowed when sessionStatus is still scheduled
const deleteLecture=asyncHandler(async(req,res)=>{
    const {lectureId}=req.params;

    const lecture=await Lecture.findById(lectureId);
    if(!lecture){
        throw new ApiError(404,"Lecture not found")
    }

    if(lecture.sessionStatus!=="Scheduled"){
            throw new ApiError(400,"Cannot delete a lecture that has already started or ended")
    }

    await lecture.deleteOne();

    return res.status(200).json(
        new ApiResponse(200,{},"Lecture deleted successfully")
    )
})


export {createLecture,getTodayTimetable,getMyTodayLectures,getAllLectures,deleteLecture};

