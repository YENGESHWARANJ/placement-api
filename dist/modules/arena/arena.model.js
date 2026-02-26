"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Discussion = exports.Experience = void 0;
const mongoose_1 = require("mongoose");
const ExperienceSchema = new mongoose_1.Schema({
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Student", required: true },
    company: { type: String, required: true },
    role: { type: String, required: true },
    date: { type: Date, default: Date.now },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
    verdict: { type: String, enum: ["Selected", "Rejected", "Waitlisted"] },
    roundWiseDetails: [{
            roundName: String,
            details: String
        }],
    tips: { type: String },
    likes: { type: Number, default: 0 }
}, { timestamps: true });
exports.Experience = mongoose_1.models.Experience || (0, mongoose_1.model)("Experience", ExperienceSchema);
const DiscussionSchema = new mongoose_1.Schema({
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Student", required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: { type: [String], default: [] },
    likes: { type: Number, default: 0 },
    replies: [{
            studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Student" },
            content: String,
            createdAt: { type: Date, default: Date.now }
        }]
}, { timestamps: true });
exports.Discussion = mongoose_1.models.Discussion || (0, mongoose_1.model)("Discussion", DiscussionSchema);
