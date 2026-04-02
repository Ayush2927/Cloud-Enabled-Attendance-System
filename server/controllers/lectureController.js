import { Lecture } from "../models/lecture.model.js";
import { Subject } from "../models/subject.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { getTodayDateString } from "../utils/timeUtils.js";

// Admin: schedule a new lecture slot
const createLecture = asyncHandler(async (req, res) => {
    const { subject, teacher, date, division, startTime, endTime } = req.body;

    if (!subject || !teacher || !date || !division || !startTime || !endTime) {
        throw new ApiError(400, "subject, division, date, teacher, start time, end time — all fields are required");
    }

    const subjectDoc = await Subject.findById(subject);
    if (!subjectDoc) {
        throw new ApiError(404, "Subject not found");
    }

    const teacherDoc = await User.findById(teacher);
    if (!teacherDoc || teacherDoc.role !== "Teacher") {
        throw new ApiError(404, "Teacher not found");
    }

    const isAssigned = subjectDoc.teachers
        .map(t => t.toString())
        .includes(teacher.toString());

    if (!isAssigned) {
        throw new ApiError(403, `${teacherDoc.name} is not assigned to subject ${subjectDoc.code}`);
    }

    const existingCount = await Lecture.countDocuments({ subject });

    const lecture = await Lecture.create({
        subject,
        teacher,
        division: division.toUpperCase(),
        lectureNumber: existingCount + 1,
        startTime,
        endTime,
        date
    });

    const populatedLecture = await lecture.populate([
        { path: "subject", select: "code name" },
        { path: "teacher", select: "name email" }
    ]);

    return res.status(201).json(
        new ApiResponse(201, populatedLecture, "Lecture scheduled successfully")
    );
});

// All roles: get today's timetable for a division
const getTodayTimetable = asyncHandler(async (req, res) => {
    const { division } = req.query;

    if (!division) {
        throw new ApiError(400, "Division parameter is required");
    }

    const today = getTodayDateString();

    const lectures = await Lecture.find({
        division: division.toUpperCase(),
        date: today
    })
        .populate("subject", "code name")
        .populate("teacher", "name email")
        .sort({ startTime: 1 });

    return res.status(200).json(
        new ApiResponse(200, lectures, `Timetable for ${division.toUpperCase()} on ${today}`)
    );
});

// Teacher: get their own lectures for today
const getMyTodayLectures = asyncHandler(async (req, res) => {
    const today = getTodayDateString();

    const lectures = await Lecture.find({
        teacher: req.user._id,
        date: today
    })
        .populate("subject", "code name")
        .sort({ startTime: 1 });

    return res.status(200).json(
        new ApiResponse(200, lectures, "Your lectures for today")
    );
});

// Admin: get all lectures with optional filters
const getAllLectures = asyncHandler(async (req, res) => {
    const { subject, division, date } = req.query;

    const filter = {};

    if (subject) {
        filter.subject = subject;
    }
    if (division) {
        filter.division = division.toUpperCase();
    }
    if (date) {
        filter.date = date;
    }

    const lectures = await Lecture.find(filter)
        .populate("subject", "code name")
        .populate("teacher", "name email")
        .sort({ date: -1, startTime: 1 });

    return res.status(200).json(
        new ApiResponse(200, lectures, "Lectures retrieved successfully")
    );
});

// Admin: delete a scheduled lecture
const deleteLecture = asyncHandler(async (req, res) => {
    const { lectureId } = req.params;

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
        throw new ApiError(404, "Lecture not found");
    }

    if (lecture.sessionStatus !== "Scheduled") {
        throw new ApiError(400, "Cannot delete a lecture that has already started or ended");
    }

    await lecture.deleteOne();

    return res.status(200).json(
        new ApiResponse(200, {}, "Lecture deleted successfully")
    );
});

export { createLecture, getTodayTimetable, getMyTodayLectures, getAllLectures, deleteLecture };
