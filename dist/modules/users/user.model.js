"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRole = void 0;
const mongoose_1 = require("mongoose");
var UserRole;
(function (UserRole) {
    UserRole["STUDENT"] = "student";
    UserRole["RECRUITER"] = "recruiter";
    UserRole["OFFICER"] = "officer";
    UserRole["ADMIN"] = "admin";
})(UserRole || (exports.UserRole = UserRole = {}));
const UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: false, default: null },
    role: {
        type: String,
        enum: Object.values(UserRole),
        default: UserRole.STUDENT,
    },
    status: {
        type: String,
        enum: ["active", "pending", "suspended", "rejected"],
        default: "active",
    },
    photoURL: { type: String, default: null },
    googleId: { type: String, default: null, sparse: true },
    // ── Email verification ──────────────────────────────────
    emailVerified: { type: Boolean, default: false },
    emailOTP: { type: String, default: null },
    emailOTPExpires: { type: Date, default: null },
    emailOTPAttempts: { type: Number, default: 0 },
    emailOTPResendCount: { type: Number, default: 0 },
    lastOTPResend: { type: Date, default: null },
    // ── Account security ────────────────────────────────────
    failedLoginAttempts: { type: Number, default: 0 },
    accountLockedUntil: { type: Date, default: null },
    // ── Profile ─────────────────────────────────────────────
    profileCompleted: { type: Boolean, default: false },
    lastLogin: { type: Date, default: null },
    provider: { type: String, enum: ["email", "google"], default: "email" },
    // ── Password reset ─────────────────────────────────────
    passwordResetToken: { type: String, default: null },
    passwordResetExpires: { type: Date, default: null },
}, { timestamps: true });
const User = (0, mongoose_1.model)("User", UserSchema);
exports.default = User;
