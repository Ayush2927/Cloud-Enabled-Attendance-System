import { Router } from "express";

import { createSubject ,
    assignTeacher,
    removeTeacher,
    getAllSubjects,
    getSubjectById} from "../controllers/subjectController.js";
import {verifyJwt} from "../middleware/auth.middleware.js"
import {authorizeRoles} from "../middleware/role.middleware.js"

const router=Router();

//Admin creates a subject
router.route("/create").post(
    verifyJwt,
    authorizeRoles("Admin"),
    createSubject
);

//Admin:To assign any teacher to a subject
router.route("/:subjectId/assign-teacher").patch(
    verifyJwt,
    authorizeRoles("Admin"),
    assignTeacher
)

//Admin:To release a teacher from a subject
router.route("/:subjectId/remove-teacher").patch(
    verifyJwt,
    authorizeRoles("Admin"),
    removeTeacher
)

//allowed for all roles to get all subjects
router.route("/all").get(
    verifyJwt,
    authorizeRoles("Admin","Student","Teacher"),
    getAllSubjects
)

//to get a single subject through their id
router.route("/:subjectId").get(
    verifyJwt,
    authorizeRoles("Admin","Student","Teacher"),
    getSubjectById
)

export default router;