"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const NoticeSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    targetUser: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: false },
    type: { type: String, enum: ["All", "Student", "Recruiter"], default: "All" },
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Low" },
}, { timestamps: true });
const Notice = mongoose_1.models.Notice || (0, mongoose_1.model)("Notice", NoticeSchema);
exports.default = Notice;
