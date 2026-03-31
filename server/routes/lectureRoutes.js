import { Router } from "express";
import { createLecture,
    getTodayTimetable,
    getMyTodayLectures,
    getAllLectures,
    deleteLecture } from "../controllers/lectureController.js";

import { verifyJwt } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router=Router();

//Admin schedules a new lecture slot
router.route("/create").post(
verifyJwt,
authorizeRoles("Admin"),
createLecture
)

//Teacher gets their own lectures for today
router.route("/my-today").get(
    verifyJwt,
    authorizeRoles("Teacher"),
    getMyTodayLectures
)

//Admin views all lectures by filter
router.route("/all").get(
    verifyJwt,
    authorizeRoles("Admin"),
    getAllLectures
)

//All roles get today's timetables for a division
//get /api/v1/lectures/today?division=SE-B
router.route("/today").get(
    verifyJwt,
    authorizeRoles("Admin","Student","Teacher"),
    getTodayTimetable
)

//Admin deleted a scheduled lecture
router.route("/:lectureId").delete(
    verifyJwt,
    authorizeRoles("Admin"),
    deleteLecture

)

export default router;