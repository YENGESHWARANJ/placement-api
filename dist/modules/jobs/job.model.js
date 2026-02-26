"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const JobSchema = new mongoose_1.Schema({
    recruiterId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    company: {
        type: String,
        required: true,
        trim: true,
    },
    location: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["Full-time", "Internship", "Contract"],
        default: "Full-time",
    },
    salary: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    requirements: {
        type: [String],
        default: [],
    },
    deadline: {
        type: Date,
        required: true,
    },
    active: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});
const Job = mongoose_1.models.Job || (0, mongoose_1.model)("Job", JobSchema);
exports.default = Job;
