import mongoose, { Schema, Document, model } from "mongoose";

export enum UserRole {
  STUDENT = "student",
  RECRUITER = "recruiter",
  OFFICER = "officer",
  ADMIN = "admin",
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string | null;
  role: UserRole;
  status: "active" | "pending" | "suspended" | "rejected";
  photoURL?: string | null;
  googleId?: string | null;

  // Email verification
  emailVerified: boolean;
  emailOTP?: string | null;
  emailOTPExpires?: Date | null;
  emailOTPAttempts: number;
  emailOTPResendCount: number;
  lastOTPResend?: Date | null;

  // Account security
  failedLoginAttempts: number;
  accountLockedUntil?: Date | null;

  // Profile
  profileCompleted: boolean;
  lastLogin?: Date | null;
  provider: "email" | "google";

  // Password reset
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
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
  },
  { timestamps: true }
);

const User = model<IUser>("User", UserSchema);
export default User;
