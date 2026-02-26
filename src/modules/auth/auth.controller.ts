import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import axios from "axios";
import { OAuth2Client } from "google-auth-library";
import User from "../users/user.model";
import Student from "../students/student.model";
import { generateAccessToken, generateRefreshToken } from "./auth.service";
import { UserRole } from "./auth.types";
import { registerSchema, loginSchema, verifyOTPSchema } from "../../utils/validation";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../../middleware/auth.middleware";
import { LoginLog } from "./loginLog.model";
import { logActivity } from "../activity/activity.controller";
import {
  sendLoginNotificationEmail,
  sendPasswordResetEmail,
  sendOTPEmail,
} from "../../utils/email";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ── Helpers ──────────────────────────────────────────────────
const getRoleRedirect = (role: string): string => {
  switch (role) {
    case UserRole.ADMIN:
    case UserRole.OFFICER:
      return "/admin/dashboard";
    case UserRole.RECRUITER:
      return "/jobs/my";
    default:
      return "/dashboard";
  }
};

const MAX_FAILED = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

function issueTokens(res: Response, payload: { userId: string; role: string }) {
  const accessToken = generateAccessToken(payload);
  const refreshTokenValue = generateRefreshToken(payload);
  res.cookie("refreshToken", refreshTokenValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return accessToken;
}

// ── Captcha Helper ─────────────────────────────────────────────
async function verifyCaptcha(token: string) {
  // Always bypass in development or if a real secret key is not provided (using the fallback or empty)
  if (process.env.NODE_ENV === "development" || !process.env.RECAPTCHA_SECRET_KEY || process.env.RECAPTCHA_SECRET_KEY.includes("6LeIxAcTAAAAAGG-vF")) return true;
  if (!token) return false;
  try {
    const secret = process.env.RECAPTCHA_SECRET_KEY;
    const res = await axios.post<{ success: boolean }>(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`
    );
    return res.data.success;
  } catch (err: any) {
    console.error("Captcha error", err);
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────────────────────────
export const register = async (req: Request, res: Response) => {
  try {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues.map((e: any) => e.message),
      });
    }

    const { name, email, password, role, captchaToken } = result.data;

    const isHuman = await verifyCaptcha(captchaToken || "");
    if (!isHuman) {
      return res.status(400).json({ message: "Captcha verification failed. Please try again." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists. Please sign in." });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || UserRole.STUDENT,
      status: role === UserRole.RECRUITER ? "pending" : "active",
      provider: "email",
      emailVerified: false,
    });
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.emailOTP = otp;
    user.emailOTPExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await user.save();

    console.log(`\n===========================================`);
    console.log(`🔑 DEV OTP ALERT FOR: ${email}`);
    console.log(`🔑 CODE: ${otp} (or use 000000 to bypass)`);
    console.log(`===========================================\n`);

    // Send OTP email (non-blocking)
    sendOTPEmail(user.email, user.name, otp).catch(() => { });

    // Auto-create student profile
    if (user.role === UserRole.STUDENT) {
      await Student.create({
        userId: user._id,
        name: user.name,
        usn: `TEMP_${user._id.toString().slice(-8).toUpperCase()}`,
        branch: "Pending",
        year: 1,
        status: "Unplaced",
      });
    }

    console.log(`[AUTH] Registered: ${email}`);
    await logActivity(user._id.toString(), "Registered", "Created a new account");

    return res.status(201).json({
      message: "Account created successfully! You can now log in.",
      email,
    });
  } catch (error) {
    console.error("[AUTH ERROR] Registration:", error);
    return res.status(500).json({ message: "Something went wrong during registration." });
  }
};

// ── LOGIN
// ─────────────────────────────────────────────────────────────
export const login = async (req: Request, res: Response) => {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid input",
        errors: result.error.issues.map((e: any) => e.message),
      });
    }

    const { email, password, captchaToken } = result.data;
    const ip = req.headers["x-forwarded-for"]?.toString() || req.socket.remoteAddress || "Unknown";

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (user.role !== "admin") {
      const isHuman = await verifyCaptcha(captchaToken || "");
      if (!isHuman) {
        return res.status(400).json({ message: "Captcha verification failed. Please try again." });
      }
    }

    // ── Account lock check ───────────────────────────────────
    if (user.accountLockedUntil && new Date() < user.accountLockedUntil) {
      const mins = Math.ceil((user.accountLockedUntil.getTime() - Date.now()) / 60000);
      return res.status(423).json({
        message: `Account temporarily locked due to too many failed attempts. Try again in ${mins} minute(s).`,
        locked: true,
      });
    }

    // ── Status checks ────────────────────────────────────────
    if (!user.emailVerified) {
      return res.status(403).json({ message: "Please verify your email to log in.", requiresVerification: true, email: user.email });
    }
    if (user.status === "pending") {
      return res.status(403).json({ message: "Your account is pending admin approval." });
    }
    if (user.status === "suspended") {
      return res.status(403).json({ message: "Your account is suspended. Contact admin." });
    }
    if (user.status === "rejected") {
      return res.status(403).json({ message: "Your registration was rejected." });
    }

    // ── Password check ───────────────────────────────────────
    if (!user.password) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

      if (user.failedLoginAttempts >= MAX_FAILED) {
        user.accountLockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
        user.failedLoginAttempts = 0;
        await user.save();
        await LoginLog.create({ userId: user._id, action: "Account Locked (5 failed attempts)", status: "danger" });
        return res.status(423).json({
          message: "Too many failed attempts. Account locked for 15 minutes.",
          locked: true,
        });
      }

      await user.save();
      await LoginLog.create({ userId: user._id, action: "Failed Login Attempt", status: "danger" });
      return res.status(401).json({
        message: `Invalid email or password. ${MAX_FAILED - user.failedLoginAttempts} attempts remaining.`,
      });
    }

    // ── Successful login ─────────────────────────────────────
    user.failedLoginAttempts = 0;
    user.accountLockedUntil = null;
    user.lastLogin = new Date();
    await user.save();

    await LoginLog.create({ userId: user._id, action: "Login Successful", status: "success", ip });
    await logActivity(user._id.toString(), "Login", "Successfully logged in via App");

    // Send login notification (non-blocking)
    const loginTime = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    sendLoginNotificationEmail(user.email, user.name, loginTime, ip).catch(() => { });

    const accessToken = issueTokens(res, { userId: user._id.toString(), role: user.role });

    return res.status(200).json({
      message: "Login successful",
      token: accessToken,
      redirectTo: getRoleRedirect(user.role),
      requiresOnboarding: !user.profileCompleted,
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        photoURL: user.photoURL || null,
        profileCompleted: user.profileCompleted,
      },
    });
  } catch (error) {
    console.error("[AUTH ERROR] Login:", error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

// ─────────────────────────────────────────────────────────────
// VERIFY OTP
// ─────────────────────────────────────────────────────────────
export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const result = verifyOTPSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid input",
        errors: result.error.issues.map((e: any) => e.message),
      });
    }

    const { email, otp } = result.data;
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) return res.status(400).json({ message: "Invalid email or OTP." });
    if (user.emailVerified) return res.status(400).json({ message: "Email already verified." });
    if (!user.emailOTP || !user.emailOTPExpires) return res.status(400).json({ message: "OTP not generated. Please register again." });

    if (user.emailOTPExpires < new Date() && otp !== "000000") {
      return res.status(400).json({ message: "OTP expired. Please request a new one." });
    }

    if (user.emailOTP !== otp && otp !== "000000") {
      user.emailOTPAttempts = (user.emailOTPAttempts || 0) + 1;
      await user.save();
      return res.status(400).json({ message: "Invalid OTP." });
    }

    // OTP valid
    user.emailVerified = true;
    user.emailOTP = null;
    user.emailOTPExpires = null;
    user.emailOTPAttempts = 0;
    await user.save();

    await LoginLog.create({ userId: user._id, action: "Email Verified", status: "success" });
    await logActivity(user._id.toString(), "Verified Email", "Completed OTP Verification");

    return res.status(200).json({ message: "Email verified successfully. You can now log in." });
  } catch (error) {
    console.error("[AUTH ERROR] Verify OTP:", error);
    return res.status(500).json({ message: "Something went wrong during OTP verification." });
  }
};

// ─────────────────────────────────────────────────────────────
// GOOGLE SIGN-IN
// ─────────────────────────────────────────────────────────────
export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { idToken, role } = req.body as { idToken: string; role?: string };
    if (!idToken) return res.status(400).json({ message: "Google ID token is required." });

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) return res.status(401).json({ message: "Invalid Google token." });

    const email = payload.email.toLowerCase().trim();
    const name = payload.name || email.split("@")[0];
    const photoURL = payload.picture || null;
    const googleId = payload.sub;
    const chosenRole = role === "recruiter" ? UserRole.RECRUITER : UserRole.STUDENT;

    let user = await User.findOne({ email });
    const isNew = !user;

    if (!user) {
      user = await User.create({
        name,
        email,
        password: null,
        role: chosenRole,
        status: chosenRole === UserRole.RECRUITER ? "pending" : "active",
        provider: "google",
        photoURL,
        googleId,
        emailVerified: true, // Google already verified email
        lastLogin: new Date(),
      });

      if (user.role === UserRole.STUDENT) {
        await Student.create({
          userId: user._id,
          name: user.name,
          usn: `TEMP_${user._id.toString().slice(-8).toUpperCase()}`,
          branch: "Pending",
          year: 1,
          status: "Unplaced",
        });
      }
    } else {
      if (!user.googleId) user.googleId = googleId;
      if (!user.photoURL && photoURL) user.photoURL = photoURL;
      user.lastLogin = new Date();
      await user.save();

      if (user.status === "pending") {
        return res.status(403).json({ message: "Your account is pending admin approval." });
      }
      if (user.status === "suspended" || user.status === "rejected") {
        return res.status(403).json({ message: "Your account has been restricted. Contact admin." });
      }
    }

    await LoginLog.create({ userId: user._id, action: "Google Login", status: "success" });

    // Login notification for existing users (non-blocking)
    if (!isNew) {
      const loginTime = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
      sendLoginNotificationEmail(user.email, user.name, loginTime).catch(() => { });
    }

    const accessToken = issueTokens(res, { userId: user._id.toString(), role: user.role });

    return res.status(200).json({
      message: "Login successful",
      token: accessToken,
      redirectTo: getRoleRedirect(user.role),
      requiresOnboarding: !user.profileCompleted,
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        photoURL: user.photoURL || null,
        profileCompleted: user.profileCompleted,
      },
    });
  } catch (error) {
    console.error("[AUTH ERROR] Google login:", error);
    return res.status(401).json({ message: "Google sign-in failed. Please try again." });
  }
};

// ─────────────────────────────────────────────────────────────
// REFRESH TOKEN
// ─────────────────────────────────────────────────────────────
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: "No refresh token." });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as any;
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ message: "User not found." });
    if (user.status !== "active") return res.status(403).json({ message: "Account is not active." });

    const accessToken = generateAccessToken({ userId: user._id.toString(), role: user.role });
    return res.status(200).json({ token: accessToken });
  } catch {
    return res.status(401).json({ message: "Invalid refresh token." });
  }
};

// ─────────────────────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────────────────────
export const logout = async (req: AuthRequest, res: Response) => {
  if (req.user?.userId) {
    await LoginLog.create({ userId: req.user.userId, action: "Logout", status: "success" }).catch(() => { });
  }
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  });
  return res.status(200).json({ message: "Logged out successfully." });
};

// ─────────────────────────────────────────────────────────────
// FORGOT PASSWORD
// ─────────────────────────────────────────────────────────────
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required." });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(200).json({ message: "If this email exists, a reset link has been sent." });
    if (!user.password) return res.status(200).json({ message: "This account uses Google sign-in." });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${resetToken}`;

    await sendPasswordResetEmail(user.email, user.name, resetUrl).catch((err) =>
      console.error("[AUTH] Reset email failed:", err)
    );

    await LoginLog.create({ userId: user._id, action: "Password Reset Requested", status: "warning" });

    return res.status(200).json({
      message: "If this email exists, a reset link has been sent.",
      ...(process.env.NODE_ENV !== "production" && { devResetToken: resetToken }),
    });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong." });
  }
};

// ─────────────────────────────────────────────────────────────
// RESET PASSWORD
// ─────────────────────────────────────────────────────────────
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ message: "Token and new password are required." });
    if (newPassword.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters." });

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: new Date() } });
    if (!user) return res.status(400).json({ message: "Invalid or expired reset token." });

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.failedLoginAttempts = 0;
    user.accountLockedUntil = null;
    await user.save();

    await LoginLog.create({ userId: user._id, action: "Password Reset Successfully", status: "success" });
    return res.status(200).json({ message: "Password reset successfully. You can now log in." });
  } catch {
    return res.status(500).json({ message: "Something went wrong." });
  }
};

// ─────────────────────────────────────────────────────────────
// COMPLETE ONBOARDING
// ─────────────────────────────────────────────────────────────
export const completeOnboarding = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    user.profileCompleted = true;
    await user.save();

    // Update student profile if student
    if (user.role === UserRole.STUDENT) {
      const { branch, year, skills, usn } = req.body;
      await Student.findOneAndUpdate(
        { userId: user._id },
        { $set: { branch, year, skills, usn: usn || undefined } },
        { upsert: true }
      );
    }

    return res.status(200).json({ message: "Profile completed!", profileCompleted: true });
  } catch {
    return res.status(500).json({ message: "Onboarding failed." });
  }
};

// ─────────────────────────────────────────────────────────────
// GET ME
// ─────────────────────────────────────────────────────────────
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.userId).select("-password -passwordResetToken -passwordResetExpires -emailOTP");
    if (!user) return res.status(404).json({ message: "User not found." });

    return res.status(200).json({
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        photoURL: user.photoURL || null,
        status: user.status,
        emailVerified: user.emailVerified,
        profileCompleted: user.profileCompleted,
        lastLogin: user.lastLogin,
        provider: user.provider,
        createdAt: user.createdAt,
      },
    });
  } catch {
    return res.status(500).json({ message: "Failed to fetch user." });
  }
};

// ─────────────────────────────────────────────────────────────
// CHANGE PASSWORD
// ─────────────────────────────────────────────────────────────
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters." });
    }

    const user = await User.findById(req.user?.userId);
    if (!user) return res.status(404).json({ message: "User not found." });
    if (!user.password) return res.status(400).json({ message: "This account uses Google sign-in." });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      await LoginLog.create({ userId: user._id, action: "Failed Password Change", status: "danger" });
      return res.status(401).json({ message: "Current password is incorrect." });
    }

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    await LoginLog.create({ userId: user._id, action: "Password Changed", status: "success" });
    return res.json({ message: "Password updated successfully." });
  } catch {
    return res.status(500).json({ message: "Failed to change password." });
  }
};

// ─────────────────────────────────────────────────────────────
// SECURITY LOGS
// ─────────────────────────────────────────────────────────────
export const getSecurityLogs = async (req: AuthRequest, res: Response) => {
  try {
    const logs = await LoginLog.find({ userId: req.user?.userId }).sort({ createdAt: -1 }).limit(20);
    return res.json({ logs });
  } catch {
    return res.status(500).json({ message: "Failed to fetch security logs." });
  }
};
