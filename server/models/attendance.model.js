import mongoose, { Schema } from "mongoose";

const attendanceSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    lecture: {
        type: Schema.Types.ObjectId,
        ref: "Lecture",
        required: true
    },
    subject: {
        type: Schema.Types.ObjectId,
        ref: "Subject",
        required: true
    },
    date: {
        type: String,
        required: true
    },
    checkIn: {
        type: Date,
        default: null
    },
    checkOut: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ["Present", "Absent", "Late", "Session_Started", "Session_Ended"],
        default: "Present"
    },
    capturedFace: {
        type: String,
        required: function () {
            return this.status === "Present";
        }
    }
}, { timestamps: true });

// Unique compound index: one attendance record per user per lecture
attendanceSchema.index({ user: 1, lecture: 1 }, { unique: true });

// Query optimization: find attendance by lecture and status
attendanceSchema.index({ lecture: 1, status: 1 });

const Attendance = mongoose.model("Attendance", attendanceSchema);

export { Attendance };