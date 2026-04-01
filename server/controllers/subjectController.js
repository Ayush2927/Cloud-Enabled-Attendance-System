import { Subject } from "../models/subject.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Admin: create a new subject
const createSubject = asyncHandler(async (req, res) => {
    const { code, name } = req.body;

    if (!code || !name) {
        throw new ApiError(400, "code and name are required");
    }

    const existing = await Subject.findOne({ code: code.toUpperCase() });

    if (existing) {
        throw new ApiError(409, `Subject with code ${code.toUpperCase()} already exists`);
    }

    const subject = await Subject.create({
        code: code.toUpperCase(),
        name,
        teachers: []
    });

    return res.status(201).json(
        new ApiResponse(201, subject, "Subject created successfully")
    );
});

// Admin: assign a teacher to a subject
const assignTeacher = asyncHandler(async (req, res) => {
    const { subjectId } = req.params;
    const { teacherId } = req.body;

    if (!teacherId) {
        throw new ApiError(400, "teacherId is required");
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
        throw new ApiError(404, "Subject not found");
    }

    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "Teacher") {
        throw new ApiError(404, "Teacher not found");
    }

    const alreadyAssigned = subject.teachers
        .map(t => t.toString())
        .includes(teacherId.toString());

    if (alreadyAssigned) {
        throw new ApiError(400, `${teacher.name} is already assigned to ${subject.code}`);
    }

    await Subject.findByIdAndUpdate(
        subjectId,
        { $push: { teachers: teacherId } },
        { new: true, runValidators: true }
    );

    await User.findByIdAndUpdate(
        teacherId,
        { $addToSet: { subjects: subjectId } },
        { new: true }
    );

    const updatedSubject = await Subject.findById(subjectId)
        .populate("teachers", "name email");

    return res.status(200).json(
        new ApiResponse(200, updatedSubject, `${teacher.name} assigned to ${subject.code} successfully`)
    );
});

// Admin: remove a teacher from a subject
const removeTeacher = asyncHandler(async (req, res) => {
    const { subjectId } = req.params;
    const { teacherId } = req.body;

    if (!teacherId) {
        throw new ApiError(400, "teacherId is required");
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
        throw new ApiError(404, "Subject not found");
    }

    const teacher = await User.findById(teacherId);
    if (!teacher) {
        throw new ApiError(404, "Teacher not found");
    }

    await Subject.findByIdAndUpdate(
        subjectId,
        { $pull: { teachers: teacherId } },
        { new: true }
    );

    await User.findByIdAndUpdate(
        teacherId,
        { $pull: { subjects: subjectId } },
        { new: true }
    );

    return res.status(200).json(
        new ApiResponse(200, {}, `${teacher.name} removed from ${subject.code} successfully`)
    );
});

// All roles: get all subjects
const getAllSubjects = asyncHandler(async (req, res) => {
    const subjects = await Subject.find()
        .populate("teachers", "name email")
        .sort({ code: 1 });

    return res.status(200).json(
        new ApiResponse(200, subjects, "Subjects retrieved successfully")
    );
});

// All roles: get a single subject by ID
const getSubjectById = asyncHandler(async (req, res) => {
    const { subjectId } = req.params;

    const subject = await Subject.findById(subjectId)
        .populate("teachers", "name email");

    if (!subject) {
        throw new ApiError(404, "Subject not found");
    }

    return res.status(200).json(
        new ApiResponse(200, subject, "Subject retrieved successfully")
    );
});

export {
    createSubject,
    assignTeacher,
    removeTeacher,
    getAllSubjects,
    getSubjectById
};