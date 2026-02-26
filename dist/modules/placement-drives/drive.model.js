"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const DriveSchema = new mongoose_1.Schema({
    company: { type: String, required: true },
    jobRole: { type: String, required: true },
    date: { type: Date, required: true },
    venue: { type: String, required: true },
    salary: { type: String },
    description: { type: String },
    criterias: {
        cgpa: { type: Number, default: 0 },
        branches: [{ type: String }],
        skills: [{ type: String }],
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Completed', 'Cancelled'],
        default: 'Scheduled',
    },
    rounds: [{ type: String }],
    contactPerson: {
        name: String,
        email: String,
        phone: String,
    },
}, { timestamps: true });
const PlacementDrive = (0, mongoose_1.model)("PlacementDrive", DriveSchema);
exports.default = PlacementDrive;
