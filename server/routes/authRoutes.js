import { Router } from "express";
import { 
    registerUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken,
    changePassword,
    getAllTeachers
} from "../controllers/authController.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = Router();

// Public routes
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

// Secured routes (Requires verifyJWT middleware)
router.route("/logout").post(verifyJwt, logoutUser);
router.route("/refresh").post(refreshAccessToken);
router.route("/change-password").patch(verifyJwt, changePassword);

// Admin-only: Get all teachers for populating dropdowns
router.route("/teachers").get(verifyJwt, authorizeRoles("Admin"), getAllTeachers);

export default router;