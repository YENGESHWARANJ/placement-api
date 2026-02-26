"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ActivityLogSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    description: { type: String, required: true },
    metadata: { type: Object, default: {} },
}, { timestamps: true });
// Index for performance
ActivityLogSchema.index({ userId: 1, createdAt: -1 });
const ActivityLog = mongoose_1.models.ActivityLog || (0, mongoose_1.model)("ActivityLog", ActivityLogSchema);
exports.default = ActivityLog;
