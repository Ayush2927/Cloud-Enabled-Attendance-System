import express from "express";
import { connectDB } from "./config/db.js";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// Route Imports
import authRoutes from "./routes/authRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";

// Configuration
dotenv.config();
connectDB();

const app = express();

// --- Middleware Stack ---

// 1. CORS: Allow cross-origin requests (essential for frontend-backend communication)
app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000", 
    credentials: true
}));

// 2. Body Parsers: These MUST come before your routes to fix the 'undefined email' error
app.use(express.json({ limit: "16kb" })); // Parses incoming JSON requests
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // Parses URL-encoded data

// 3. Cookie Parser: Required for reading JWTs from cookies
app.use(cookieParser());

// --- Routes ---

// Health Check Route
app.get("/", (req, res) => {
    res.send("API is running");
});

// Authentication Routes (Prefixed with /api/auth)
app.use("/api/auth", authRoutes);
app.use("/api/v1/attendance",attendanceRoutes)

// --- Error Handling ---

// Custom Error Handler Middleware
// --- Error Handling ---

// Custom Error Handler Middleware
// --- Error Handling ---

app.use((err, req, res, next) => {

    console.error(" ERROR CAUGHT:");
    console.error("Status:", err.statusCode || 500);
    console.error("Message:", err.message);
    console.error("Stack:", err.stack);
    console.error("Full Error:", err);
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal server error";

    // FIX: Safely check if 'errors' exists to avoid the "is not defined" crash
    const errors = err.errors ? err.errors : [];

    res.status(statusCode).json({
        success: false,
        message: message,
        errors: errors 
    });
});
// --- Server Startup ---

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on PORT: ${PORT}`);
});