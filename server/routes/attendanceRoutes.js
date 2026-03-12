import { Router } from "express";
import { markStudentAttendance,logTeacherShift,getAdminReports,getStoredFace } from "../controllers/attendanceController.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router=Router();


router.route("/student/mark").post(
    verifyJwt,
    authorizeRoles("Student"),
    markStudentAttendance
)


router.route("/teacher/shift").post(
    verifyJwt,
    authorizeRoles("Teacher"),
    logTeacherShift
)

router.route("/admin/all-logs").get(
    verifyJwt,
    authorizeRoles("Admin"),
    getAdminReports

)

router.route("/get-face").get(
    verifyJwt,
    authorizeRoles("Student"),
    getStoredFace
)

export default router;