import express from "express";
import { connectDB } from "./config/db.js";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";

// Route Imports
import authRoutes from "./routes/authRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import lectureRoutes from "./routes/lectureRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";

// Configuration
dotenv.config();
connectDB();

const app = express();

// --- Security Middleware ---

// Helmet: sets security-related HTTP headers
app.use(helmet());

// Rate limiting: prevent brute force & DoS
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests, please try again later" }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many login attempts, please try again later" }
});

app.use(generalLimiter);

// CORS: Dynamically allow the requesting origin (perfect for Vercel + Local dev simultaneously)
app.use(cors({
    origin: function(origin, callback) {
        callback(null, origin || true);
    },
    credentials: true,
    methods: ["GET", "PUT", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
}));

// Body Parsers: reasonable limit to prevent abuse
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// NoSQL Injection Prevention removed temporarily due to Express v5 incompatibility
// Cookie Parser
app.use(cookieParser());

// --- Routes ---

// Health Check
app.get("/", (req, res) => {
    res.send("API is running");
});

// API Routes — stricter rate limit on auth endpoints
app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/attendance", attendanceRoutes);
app.use("/api/v1/lectures", lectureRoutes);
app.use("/api/v1/subjects", subjectRoutes);

// --- Error Handling ---

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal server error";
    const errors = err.errors || [];

    if (process.env.NODE_ENV !== "production") {
        console.error(`[${statusCode}] ${message}`);
    }

    res.status(statusCode).json({
        success: false,
        message,
        errors
    });
});

// --- Server Startup ---

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on PORT: ${PORT}`);
});