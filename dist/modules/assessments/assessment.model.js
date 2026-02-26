"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const AssessmentSchema = new mongoose_1.Schema({
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Student", required: true },
    type: { type: String, enum: ["Aptitude", "Coding", "Interview"], required: true },
    title: { type: String, required: true },
    score: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    timeTaken: { type: Number, default: 0 },
    results: [mongoose_1.Schema.Types.Mixed],
    topicAnalysis: [{
            topic: String,
            score: Number,
            total: Number
        }],
    status: { type: String, enum: ["Completed", "In-Progress"], default: "Completed" }
}, { timestamps: true });
const Assessment = mongoose_1.models.Assessment || (0, mongoose_1.model)("Assessment", AssessmentSchema);
exports.default = Assessment;
