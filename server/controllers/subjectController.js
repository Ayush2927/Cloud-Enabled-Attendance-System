// Subject model — the document we are creating and updating
import { Subject } from "../models/subject.model.js";

// User model — needed to verify the teacher exists before assigning them
import { User } from "../models/user.model.js";

// ApiError, ApiResponse, asyncHandler — same utilities used across all controllers
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: Create a new subject
// POST /api/v1/subjects/create
// Body: { code, name }
//
// This is the first thing admin does when setting up the system.
// Creates the subject document that lectures and users will reference.
// ─────────────────────────────────────────────────────────────────────────────
const createSubject = asyncHandler(async (req, res) => {

    // destructuring — pulls code and name out of req.body
    const { code, name } = req.body;

    if (!code || !name) {
        throw new ApiError(400, "code and name are required");
    }

    // check if a subject with this code already exists
    // Subject.findOne() — returns first matching document or null
    // code.toUpperCase() — ensures "dbms" and "DBMS" don't create duplicates
    // the model also has uppercase:true but we normalise here too for safety
    const existing = await Subject.findOne({ code: code.toUpperCase() });

    if (existing) {
        throw new ApiError(409, `Subject with code ${code.toUpperCase()} already exists`);
        // 409 = Conflict — the correct HTTP code when a resource already exists
    }

    // Subject.create() — creates and saves the new subject document
    const subject = await Subject.create({
        code: code.toUpperCase(), // "dbms" → "DBMS"
        name,                     // shorthand for name: name
        teachers: []              // empty array — teachers assigned separately
    });

    return res.status(201).json(
        new ApiResponse(201, subject, "Subject created successfully")
    );
});


// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: Assign a teacher to a subject
// PATCH /api/v1/subjects/:subjectId/assign-teacher
// Body: { teacherId }
//
// This is what gives a teacher permission to take a subject.
// When admin schedules a lecture, the teacher validation checks
// subject.teachers.includes(teacherId) — that check only works
// after this route has been called.
//
// Also updates the teacher's own User document subjects array
// so the User model stays consistent with the Subject model.
// ─────────────────────────────────────────────────────────────────────────────
const assignTeacher = asyncHandler(async (req, res) => {

    // req.params — object containing route parameters
    // PATCH /api/v1/subjects/:subjectId/assign-teacher
    // → req.params = { subjectId: "64a7f..." }
    const { subjectId } = req.params;

    // teacherId comes from the request body
    const { teacherId } = req.body;

    if (!teacherId) {
        throw new ApiError(400, "teacherId is required");
    }

    // confirm the subject exists
    const subject = await Subject.findById(subjectId);
    if (!subject) {
        throw new ApiError(404, "Subject not found");
    }

    // confirm the teacher exists and has the Teacher role
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "Teacher") {
        throw new ApiError(404, "Teacher not found");
    }

    // check if teacher is already assigned to this subject
    // subject.teachers is [ObjectId, ObjectId...]
    // .map(t => t.toString()) converts each ObjectId to a plain string
    // .includes() checks if teacherId string is in that array
    const alreadyAssigned = subject.teachers
        .map(t => t.toString())
        .includes(teacherId.toString());

    if (alreadyAssigned) {
        throw new ApiError(400, `${teacher.name} is already assigned to ${subject.code}`);
    }

    // $push — MongoDB operator, appends a value to an array field
    // findByIdAndUpdate() — mongoose method, finds by _id and updates in one step
    // { new: true } — return the updated document, not the original
    // { runValidators: true } — run schema validators on the update
    await Subject.findByIdAndUpdate(
        subjectId,
        { $push: { teachers: teacherId } }, // add teacherId to teachers array
        { new: true, runValidators: true }
    );

    // also update the teacher's User document
    // keeps User.subjects in sync with Subject.teachers
    // $addToSet — MongoDB operator, adds value to array ONLY if it doesn't exist
    // safer than $push here because $push would add duplicates if called twice
    await User.findByIdAndUpdate(
        teacherId,
        { $addToSet: { subjects: subjectId } }, // add subjectId to subjects array
        { new: true }
    );

    // fetch the fully updated subject with teacher details populated
    // so the response shows names not just ObjectIds
    const updatedSubject = await Subject.findById(subjectId)
        .populate("teachers", "name email"); // populate teachers array with name + email

    return res.status(200).json(
        new ApiResponse(200, updatedSubject, `${teacher.name} assigned to ${subject.code} successfully`)
    );
});


// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: Remove a teacher from a subject
// PATCH /api/v1/subjects/:subjectId/remove-teacher
// Body: { teacherId }
//
// Reverse of assignTeacher — removes the teacher from both
// Subject.teachers[] and User.subjects[]
// ─────────────────────────────────────────────────────────────────────────────
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

    // $pull — MongoDB operator, removes all instances of a value from an array
    // opposite of $push
    await Subject.findByIdAndUpdate(
        subjectId,
        { $pull: { teachers: teacherId } }, // remove teacherId from teachers array
        { new: true }
    );

    // also remove from teacher's User document
    await User.findByIdAndUpdate(
        teacherId,
        { $pull: { subjects: subjectId } }, // remove subjectId from subjects array
        { new: true }
    );

    return res.status(200).json(
        new ApiResponse(200, {}, `${teacher.name} removed from ${subject.code} successfully`)
    );
});


// ─────────────────────────────────────────────────────────────────────────────
// ALL ROLES: Get all subjects
// GET /api/v1/subjects/all
//
// Used by the admin "Schedule Lecture" form to populate the subject dropdown.
// Also used by the teacher assignment form.
// populate("teachers") brings in teacher names so the frontend
// can show who is already assigned to each subject.
// ─────────────────────────────────────────────────────────────────────────────
const getAllSubjects = asyncHandler(async (req, res) => {

    // find all subjects, populate the teachers array with name and email
    // .sort({ code: 1 }) — sort alphabetically by subject code
    // "CN" comes before "DBMS" comes before "OS"
    const subjects = await Subject.find()
        .populate("teachers", "name email")
        .sort({ code: 1 });

    return res.status(200).json(
        new ApiResponse(200, subjects, "Subjects retrieved successfully")
    );
});


// ─────────────────────────────────────────────────────────────────────────────
// ALL ROLES: Get a single subject by ID
// GET /api/v1/subjects/:subjectId
//
// Used when the frontend needs full details for one subject —
// e.g. admin clicking on a subject to see all assigned teachers
// ─────────────────────────────────────────────────────────────────────────────
const getSubjectById = asyncHandler(async (req, res) => {

    // req.params.subjectId — from the route /api/v1/subjects/:subjectId
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


// named exports
export {
    createSubject,
    assignTeacher,
    removeTeacher,
    getAllSubjects,
    getSubjectById
};