"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginLog = void 0;
const mongoose_1 = require("mongoose");
const LoginLogSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    location: { type: String, default: "Unknown" },
    device: { type: String, default: "Unknown" },
    ip: { type: String, default: null },
    status: { type: String, enum: ["success", "warning", "danger"], default: "success" }
}, { timestamps: true });
exports.LoginLog = mongoose_1.models.LoginLog || (0, mongoose_1.model)("LoginLog", LoginLogSchema);
