import mongoose from "mongoose";
import Jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
{
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    refreshToken: { type: String },
    role: { 
        type: String, 
        enum: ["Teacher", "Student", "Admin"], 
        default: "Student" 
    },
    faceData:{
        type:String,
        default:null
    },

    isFaceRegistered:{
        type:Boolean,
        default:false
    },
    subjects:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Subjects"


        
    }
}, { timestamps: true });

// Password hashing middleware
// ✅ CORRECT - Remove next() call for async functions
UserSchema.pre("save", async function() {
    if(!this.isModified("password")) return ;

    this.password = await bcrypt.hash(this.password, 10);
    // Remove the next() call here!
});

// Password comparison method
UserSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password);
};

// --- FIXES ARE HERE ---

UserSchema.methods.generateAccessToken = function() {
    return Jwt.sign(
        {
            _id: this._id,
            email: this.email,
            role: this.role
        },
        process.env.ACCESS_TOKEN_SECRET, // 1. Use the correct secret name
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d"
        }
    );
};

UserSchema.methods.generateRefreshToken = function() {
    // 2. YOU MUST USE THE 'return' KEYWORD HERE
    return Jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET, // 3. Use the correct secret name
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "10d"
        }
    );
};

const User = mongoose.model("User", UserSchema);
export { User };