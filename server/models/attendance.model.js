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

// Query optimization: find attendance by user, lecture and date (you probably don't want a strict unique constraint if "sessions" can restart on the same day for the same lecture, or maybe you do: user_1_lecture_1_date_1)
attendanceSchema.index({ user: 1, lecture: 1, date: 1 });

// Query optimization: find attendance by lecture and status
attendanceSchema.index({ lecture: 1, status: 1 });

const Attendance = mongoose.model("Attendance", attendanceSchema);

export { Attendance };