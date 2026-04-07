import mongoose from "mongoose";
import Jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
{
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    refreshToken: { type: String },
    role: {
        type: String,
        enum: ["Teacher", "Student", "Admin"],
        default: "Student"
    },
    faceData: {
        type: String,
        default: null
    },
    faceDescriptor: {
        type: [Number],
        default: []
    },
    isFaceRegistered: {
        type: Boolean,
        default: false
    },
    subjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject"
    }]
}, { timestamps: true });

// Index on role for frequent role-based queries
UserSchema.index({ role: 1 });

// Password hashing middleware
UserSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// Password comparison method
UserSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

UserSchema.methods.generateAccessToken = function () {
    return Jwt.sign(
        {
            _id: this._id,
            email: this.email,
            role: this.role
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d"
        }
    );
};

UserSchema.methods.generateRefreshToken = function () {
    return Jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "10d"
        }
    );
};

const User = mongoose.model("User", UserSchema);
export { User };