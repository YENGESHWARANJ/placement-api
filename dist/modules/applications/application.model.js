"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ApplicationSchema = new mongoose_1.Schema({
    jobId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Job",
        required: true,
    },
    studentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Student", // Link to Student model
        required: true,
    },
    status: {
        type: String,
        enum: ["Applied", "Shortlisted", "Interviewing", "Rejected", "Selected"],
        default: "Applied",
    },
    resumeUrl: {
        type: String, // Optional URL if they want to use a specific resume version
    },
    matchScore: {
        type: Number,
        default: 0
    },
    aiInsights: {
        type: String,
        default: ""
    },
    appliedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
});
// Prevent duplicate applications
ApplicationSchema.index({ jobId: 1, studentId: 1 }, { unique: true });
const Application = mongoose_1.models.Application || (0, mongoose_1.model)("Application", ApplicationSchema);
exports.default = Application;
