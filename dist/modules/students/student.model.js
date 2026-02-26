"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const StudentSchema = new mongoose_1.Schema({
    recruiterId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: false // For now
    },
    // Linked User
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    usn: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
    },
    branch: {
        type: String, // Department
        required: true,
    },
    year: {
        type: Number,
        required: true,
    },
    cgpa: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ["Placed", "Unplaced", "Offers Received"],
        default: "Unplaced",
    },
    company: {
        type: String,
        default: null,
    },
    skills: {
        type: [String],
        default: [],
    },
    resumeScore: {
        type: Number,
        default: 0,
    },
    aptitudeScore: {
        type: Number,
        default: 0,
    },
    codingScore: {
        type: Number,
        default: 0,
    },
    interviewScore: {
        type: Number,
        default: 0,
    },
    careerObjective: {
        type: String,
        default: "Full Stack Developer",
    },
    roadmap: {
        type: [
            {
                id: Number,
                title: String,
                status: { type: String, enum: ["completed", "in-progress", "locked"] },
                description: String,
                tasks: [String],
                progress: Number,
            },
        ],
        default: [],
    },
    about: {
        type: String,
        default: "",
    },
    linkedin: {
        type: String,
        default: "",
    },
    github: {
        type: String,
        default: "",
    },
    website: {
        type: String,
        default: "",
    },
    profilePicture: {
        type: String,
        default: "",
    },
    savedJobIds: {
        type: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Job" }],
        default: [],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});
const Student = mongoose_1.models.Student || (0, mongoose_1.model)("Student", StudentSchema);
exports.default = Student;
