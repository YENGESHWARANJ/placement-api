"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const InterviewSessionSchema = new mongoose_1.Schema({
    applicationId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Application", required: true },
    jobId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Job", required: true },
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Student", required: true },
    recruiterId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    scheduledAt: { type: Date, required: true },
    type: {
        type: String,
        enum: ["Technical", "HR", "Managerial", "System Design"],
        default: "Technical"
    },
    mode: {
        type: String,
        enum: ["Virtual", "In-Person"],
        default: "Virtual"
    },
    link: { type: String },
    location: { type: String },
    status: {
        type: String,
        enum: ["Scheduled", "Completed", "Cancelled", "No Show"],
        default: "Scheduled"
    },
    feedback: {
        logicScore: { type: Number, default: 0 },
        communicationScore: { type: Number, default: 0 },
        cultureFitScore: { type: Number, default: 0 },
        overallScore: { type: Number, default: 0 },
        comments: { type: String, default: "" },
        strengths: { type: [String], default: [] },
        weaknesses: { type: [String], default: [] }
    },
    aiComparison: { type: String, default: "" }
}, { timestamps: true });
const InterviewSession = mongoose_1.models.InterviewSession || (0, mongoose_1.model)("InterviewSession", InterviewSessionSchema);
exports.default = InterviewSession;
