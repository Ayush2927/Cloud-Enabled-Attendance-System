import { Router } from "express";
import { 
    registerUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken 
} from "../controllers/authController.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router();

// Public routes
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

// Secured routes (Requires verifyJWT middleware)
router.route("/logout").post(verifyJwt, logoutUser);
router.route("/refresh").post(refreshAccessToken);

export default router;