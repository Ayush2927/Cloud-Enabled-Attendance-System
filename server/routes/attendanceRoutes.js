import { Router } from "express";

import {
    markStudentAttendance,
    logTeacherShift,
    getAdminReports,
    getMyAttendanceStats,  // NEW — student percentage route
    getStoredFace,
    getTeacherStudentStats
} from "../controllers/attendanceController.js";

import { verifyJwt } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = Router();

// Student marks attendance for a specific lecture
// POST /api/v1/attendance/student/mark
// Body: { lectureId, liveFaceImage }
router.route("/student/mark").post(
    verifyJwt,
    authorizeRoles("Student"),
    markStudentAttendance
);

// Teacher starts or ends a session
// POST /api/v1/attendance/teacher/shift
// Body: { lectureId }
// first call → opens session, second call → closes session + auto-marks absent
router.route("/teacher/shift").post(
    verifyJwt,
    authorizeRoles("Teacher"),
    logTeacherShift
);

// Admin views full attendance log
// GET /api/v1/attendance/admin/all-logs
router.route("/admin/all-logs").get(
    verifyJwt,
    authorizeRoles("Admin"),
    getAdminReports
);

// Student views their own attendance percentage per subject
// GET /api/v1/attendance/my-stats
router.route("/my-stats").get(
    verifyJwt,
    authorizeRoles("Student"),
    getMyAttendanceStats
);

// Student fetches their stored face reference for frontend face comparison
// GET /api/v1/attendance/get-face
router.route("/get-face").get(
    verifyJwt,
    authorizeRoles("Student"),
    getStoredFace
);

// Teacher fetches student stats by division
// GET /api/v1/attendance/teacher/division-stats
router.route("/teacher/division-stats").get(
    verifyJwt,
    authorizeRoles("Teacher"),
    getTeacherStudentStats
);

export default router;