import { Attendance } from "../models/attendance.model.js";
import { Lecture } from "../models/lecture.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { formatToIST, getTodayDateString } from "../utils/timeUtils.js";

const isLikelyBase64Image = (value) => {
    return typeof value === "string" && value.startsWith("data:image/") && value.includes(";base64,");
};

const markStudentAttendance = asyncHandler(async (req, res) => {
    const { lectureId, liveFaceImage, liveFaceDescriptor } = req.body;
    const studentId = req.user._id;

    if (!lectureId || !liveFaceImage || !liveFaceDescriptor) {
        throw new ApiError(400, "lectureId, liveFaceImage, and liveFaceDescriptor are required");
    }

    if (!isLikelyBase64Image(liveFaceImage)) {
        throw new ApiError(401, "Biometric face detection failed, no clear face detected");
    }

    if (!Array.isArray(liveFaceDescriptor) || liveFaceDescriptor.length !== 128) {
        throw new ApiError(400, "Invalid face descriptor provided");
    }

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
        throw new ApiError(404, "Lecture not found");
    }

    if (lecture.sessionStatus !== "Active") {
        throw new ApiError(400, "No active session found for this lecture");
    }

    // 15-minute window check for attendance
    const sessionAge = Date.now() - new Date(lecture.sessionStartedAt).getTime();
    const FIFTEEN_MINUTES = 15 * 60 * 1000;

    if (sessionAge > FIFTEEN_MINUTES) {
        throw new ApiError(400, "Attendance window has been closed, session started more than 15 minutes ago");
    }

    // Fetch user with face descriptor
    const user = await User.findById(studentId).select("+faceDescriptor");
    
    if (!user || !user.faceDescriptor || user.faceDescriptor.length === 0) {
        throw new ApiError(400, "User has no registered biometric ID");
    }

    // Face-API Euclidean Distance Comparison with STRICT threshold
    const DISTANCE_THRESHOLD = 0.42;
    let distance = 0;
    for (let i = 0; i < 128; i++) {
        distance += Math.pow(user.faceDescriptor[i] - liveFaceDescriptor[i], 2);
    }
    distance = Math.sqrt(distance);

    if (distance > DISTANCE_THRESHOLD) {
        throw new ApiError(401, `Biometric verification failed — face doesn't match registered user (Diff: ${distance.toFixed(2)})`);
    }

    // RACE CONDITION FIX: Use atomic findOneAndUpdate with upsert
    // This prevents duplicate records even if multiple requests arrive simultaneously
    const today = getTodayDateString();
    
    const record = await Attendance.findOneAndUpdate(
        {
            user: studentId,
            lecture: lectureId,
            date: today
        },
        {
            user: studentId,
            subject: lecture.subject,
            lecture: lectureId,
            date: today,
            status: "Present",
            capturedFace: liveFaceImage
        },
        {
            upsert: true,
            new: true,
            runValidators: true
        }
    );

    // Check if this was an existing record (not newly created)
    const isNewRecord = !record.createdAt || 
                       (Date.now() - new Date(record.createdAt).getTime()) < 1500;

    if (!isNewRecord && record.status === "Present") {
        throw new ApiError(400, "You have already marked attendance for this lecture");
    }

    return res.status(201).json(
        new ApiResponse(201, {
            ...record._doc,
            markedAtIst: formatToIST(record.createdAt || new Date())
        }, "Attendance marked successfully")
    );
});

const logTeacherShift = asyncHandler(async (req, res) => {
    const { lectureId } = req.body;
    const teacherId = req.user._id;

    if (!lectureId) {
        throw new ApiError(400, "lecture ID is required");
    }

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
        throw new ApiError(404, "Lecture not found");
    }

    if (lecture.teacher.toString() !== teacherId.toString()) {
        throw new ApiError(403, "You are not assigned to this lecture");
    }

    const today = getTodayDateString();

    // Start session
    if (lecture.sessionStatus === "Scheduled") {
        lecture.sessionStatus = "Active";
        lecture.sessionStartedAt = new Date();
        await lecture.save();

        const record = await Attendance.create({
            user: teacherId,
            subject: lecture.subject,
            lecture: lectureId,
            date: today,
            checkIn: new Date(),
            status: "Session_Started"
        });

        return res.status(201).json(
            new ApiResponse(201, {
                lecture,
                record: {
                    ...record._doc,
                    checkInIST: formatToIST(record.checkIn)
                }
            }, "Session Started Successfully")
        );
    }

    // End session
    if (lecture.sessionStatus === "Active") {
        lecture.sessionStatus = "Ended";
        lecture.sessionEndedAt = new Date();
        await lecture.save();

        const teacherRecord = await Attendance.findOneAndUpdate(
            { user: teacherId, lecture: lectureId },
            { checkOut: new Date(), status: "Session_Ended" },
            { new: true }
        );

        const presentStudentIds = await Attendance.find({
            lecture: lectureId,
            status: "Present"
        }).distinct("user");

        const enrolledStudents = await User.find({
            role: "Student",
            subjects: lecture.subject
        }).select("_id");

        const absentStudents = enrolledStudents.filter(student =>
            !presentStudentIds
                .map(id => id.toString())
                .includes(student._id.toString())
        );

        if (absentStudents.length > 0) {
            const absentRecords = absentStudents.map(student => ({
                user: student._id,
                lecture: lectureId,
                subject: lecture.subject,
                date: today,
                status: "Absent"
            }));

            await Attendance.insertMany(absentRecords, { ordered: false });
        }

        return res.status(200).json(
            new ApiResponse(200, {
                lecture,
                record: teacherRecord ? {
                    ...teacherRecord._doc,
                    checkInIST: formatToIST(teacherRecord.checkIn),
                    checkOutIST: formatToIST(teacherRecord.checkOut)
                } : null,
                absentMarked: absentStudents.length
            }, `Session Ended. ${absentStudents.length} students auto-marked absent`)
        );
    }

    throw new ApiError(400, "This session has already ended");
});

const getAdminReports = asyncHandler(async (req, res) => {
    const allLogs = await Attendance.find()
        .populate("user", "name role email")
        .populate("lecture", "lectureNumber date startTime division")
        .populate("subject", "code name")
        .sort({ createdAt: -1 });

    const logsWithIST = allLogs.map(log => ({
        ...log._doc,
        dateIST: formatToIST(log.createdAt),
        checkInIST: log.checkIn ? formatToIST(log.checkIn) : "N/A",
        checkOutIST: log.checkOut
            ? formatToIST(log.checkOut)
            : log.status === "Session_Started"
                ? "Active Session"
                : "N/A",
        hasFaceProof: !!log.capturedFace
    }));

    return res.status(200).json(
        new ApiResponse(200, logsWithIST, "All attendance logs retrieved successfully")
    );
});

const getMyAttendanceStats = asyncHandler(async (req, res) => {
    const studentId = req.user._id;

    const presentRecords = await Attendance.find({
        user: studentId,
        status: "Present"
    }).select("subject lecture");

    const endedLectures = await Lecture.find({
        sessionStatus: "Ended"
    }).populate("subject", "code name");

    const totalBySubject = endedLectures.reduce((acc, lecture) => {
        const subjectId = lecture.subject._id.toString();

        if (!acc[subjectId]) {
            acc[subjectId] = {
                total: 0,
                code: lecture.subject.code,
                name: lecture.subject.name
            };
        }
        acc[subjectId].total += 1;
        return acc;
    }, {});

    const attendedBySubject = presentRecords.reduce((acc, record) => {
        const subjectId = record.subject.toString();
        acc[subjectId] = (acc[subjectId] || 0) + 1;
        return acc;
    }, {});

    const stats = Object.keys(totalBySubject).map(subjectId => {
        const total = totalBySubject[subjectId].total;
        const attended = attendedBySubject[subjectId] || 0;
        const percentage = Math.round((attended / total) * 100);

        return {
            subjectId,
            subjectCode: totalBySubject[subjectId].code,
            subjectName: totalBySubject[subjectId].name,
            attended,
            total,
            percentage,
            status: percentage >= 75 ? "safe" : "at-risk"
        };
    });

    return res.status(200).json(
        new ApiResponse(200, stats, "Attendance stats retrieved")
    );
});

const getStoredFace = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("faceData");
    if (!user || !user.faceData) {
        throw new ApiError(404, "Biometric reference not found. Please register yourself");
    }

    return res.status(200).json(
        new ApiResponse(200, { faceData: user.faceData }, "Reference face fetched successfully")
    );
});

// Teacher gets all students' stats across their lectures, grouped by Division
const getTeacherStudentStats = asyncHandler(async (req, res) => {
    const teacherId = req.user._id;

    // Find all ended lectures taught by this teacher
    const lectures = await Lecture.find({ teacher: teacherId, sessionStatus: "Ended" }).populate("subject", "code name");

    // Fetch attendance for these lectures
    const attendanceRecords = await Attendance.find({ 
        lecture: { $in: lectures.map(l => l._id) }
    }).populate("user", "name email");

    // Calculate aggregated stats by division
    const statsByDivision = {};

    lectures.forEach(lecture => {
        const div = lecture.division;
        if (!statsByDivision[div]) {
            statsByDivision[div] = {
                 division: div,
                 totalLectures: 0,
                 students: {}
            };
        }
        statsByDivision[div].totalLectures += 1;
    });

    attendanceRecords.forEach(record => {
        const div = record.lecture.division;
        const studentId = record.user._id.toString();
        
        if (!statsByDivision[div].students[studentId]) {
            statsByDivision[div].students[studentId] = {
                _id: studentId,
                name: record.user.name,
                email: record.user.email,
                attended: 0
            };
        }
        
        if (record.status === "Present" || record.status === "Late") {
             statsByDivision[div].students[studentId].attended += 1;
        }
    });

    const formattedStats = Object.values(statsByDivision).map(divStat => {
         return {
             division: divStat.division,
             totalLectures: divStat.totalLectures,
             students: Object.values(divStat.students).map(s => ({
                 ...s,
                 percentage: divStat.totalLectures > 0 ? Math.round((s.attended / divStat.totalLectures) * 100) : 0
             }))
         };
    });

    return res.status(200).json(new ApiResponse(200, formattedStats, "Student stats by division fetched"));
});

const getLectureAttendance = asyncHandler(async (req, res) => {
    const { lectureId } = req.params;
    const teacherId = req.user._id;

    // Verify lecture belongs to this teacher
    const lecture = await Lecture.findById({ _id: lectureId, teacher: teacherId });
    if (!lecture) {
        throw new ApiError(404, "Lecture not found or unauthorized");
    }

    // Fetch all present students for this lecture
    const attendanceRecords = await Attendance.find({
        lecture: lectureId,
        status: "Present"
    }).populate("user", "name email rollNumber profileImage");

    return res.status(200).json(
        new ApiResponse(200, attendanceRecords, "Lecture attendance fetched successfully")
    );
});

export { markStudentAttendance, logTeacherShift, getAdminReports, getStoredFace, getMyAttendanceStats, getTeacherStudentStats, getLectureAttendance };