import mongoose, { Schema } from "mongoose";

const lectureSchema = new Schema({
    subject: {
        type: Schema.Types.ObjectId,
        ref: "Subject",
        required: true
    },
    teacher: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    division: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    date: {
        type: String,
        required: true
    },
    lectureNumber: {
        type: Number,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    sessionStatus: {
        type: String,
        enum: ["Scheduled", "Active", "Ended"],
        default: "Scheduled"
    },
    sessionStartedAt: {
        type: Date,
        default: null
    },
    sessionEndedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

// All lectures for a division on a given day
lectureSchema.index({ date: 1, division: 1 });

// Active session lookup for a subject on a given day
lectureSchema.index({ subject: 1, date: 1, sessionStatus: 1 });

const Lecture = mongoose.model("Lecture", lectureSchema);
export { Lecture };
