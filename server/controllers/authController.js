import Jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const isLikelyBase64Image = (value) => {
    return typeof value === "string" && value.startsWith("data:image/") && value.includes(";base64,");
};

const cookieOptions = {
    httpOnly: true,
    secure: true, // Required by all major browsers when sameSite is 'none'
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax" // "none" allows cross-domain cookies (Vercel <-> Render)
};

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Error generating tokens");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { email, name, role, password, subjects, faceImage, faceDescriptor } = req.body;

    if (!email || !password || !name || !faceImage || !faceDescriptor) {
        throw new ApiError(400, "All fields, including face image and descriptor are required");
    }

    if (typeof faceImage !== 'string' || faceImage.length < 50 || faceImage === 'data:,') {
        throw new ApiError(400, "Invalid biometric data. Please re-capture your face clearly.");
    }

    const existingUser = await User.findOne({ email: String(email) });

    if (existingUser) {
        throw new ApiError(409, "User already exists with this email");
    }

    // Mathematical Comparison of Euclidean Distance
    const DISTANCE_THRESHOLD = 0.45; // lower means stricter match. 0.45 is standard for face-api
    
    // Fetch all users that have a faceDescriptor array populated
    const existingUsersWithFaces = await User.find({ 
        faceDescriptor: { $exists: true, $not: { $size: 0 } } 
    }).select("name faceDescriptor");

    for (const existing of existingUsersWithFaces) {
        if (existing.faceDescriptor && existing.faceDescriptor.length === 128) {
            let distance = 0;
            // Calculate euclidean distance
            for (let i = 0; i < 128; i++) {
                distance += Math.pow(existing.faceDescriptor[i] - faceDescriptor[i], 2);
            }
            distance = Math.sqrt(distance);

            // If the math formula says they are less than 0.45 apart, it's the exact same face
            if (distance < DISTANCE_THRESHOLD) {
                throw new ApiError(409, `Biometric conflict: Face already registered to user "${existing.name}"`);
            }
        }
    }

    const user = await User.create({
        name,
        email,
        password,
        role,
        faceData: faceImage,
        faceDescriptor,
        isFaceRegistered: true,
        subjects: (role === "Teacher" || role === "Admin") ? subjects : []
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password, liveFaceImage, liveFaceDescriptor } = req.body;

    if (!email || !password || !liveFaceImage) {
        throw new ApiError(400, "Email, password and face image is required for successful login");
    }

    const user = await User.findOne({ email: String(email) }).select("+password");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password");
    }

    if (!user.faceData || !user.faceDescriptor || user.faceDescriptor.length === 0) {
        throw new ApiError(400, "User has no registered Face ID");
    }

    if (!isLikelyBase64Image(liveFaceImage)) {
        throw new ApiError(401, "Biometric verification failed — invalid face image");
    }

    if (liveFaceDescriptor && liveFaceDescriptor.length === 128) {
        // Verify against registered face descriptor
        const DISTANCE_THRESHOLD = 0.42; // Tighter strictness (0.35-0.45 is best to avoid false positives)
        let distance = 0;
        for (let i = 0; i < 128; i++) {
            distance += Math.pow(user.faceDescriptor[i] - liveFaceDescriptor[i], 2);
        }
        distance = Math.sqrt(distance);

        if (distance > DISTANCE_THRESHOLD) {
            throw new ApiError(401, `Biometric verification failed — face doesn't match registered user (Diff: ${distance.toFixed(2)})`);
        }
    } else {
        throw new ApiError(400, "Biometric verification failed — no face descriptor provided");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully")
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { $set: { refreshToken: null } },
        { returnDocument: "after" }
    );

    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = Jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Refresh token expired or used");
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", newRefreshToken, cookieOptions)
            .json(
                new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed")
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        throw new ApiError(400, "Current and new password are required");
    }

    const user = await User.findById(req.user?._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(currentPassword);
    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid current password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getAllTeachers = asyncHandler(async (req, res) => {
    const teachers = await User.find({ role: "Teacher" }).select("-password -refreshToken");
    return res.status(200).json(new ApiResponse(200, teachers, "Teachers fetched successfully"));
});

export { registerUser, loginUser, logoutUser, refreshAccessToken, changePassword, getAllTeachers };