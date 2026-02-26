import { Router } from "express";
import {
    register,
    login,
    googleLogin,
    refreshToken,
    logout,
    forgotPassword,
    resetPassword,
    getMe,
    changePassword,
    getSecurityLogs,
    completeOnboarding,
    verifyOTP,
} from "./auth.controller";
import { authRateLimiter } from "../../middleware/rateLimit.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

// ─── Public Auth Routes (rate-limited) ─────────────────────────────────────
router.post("/register", authRateLimiter, register);
router.post("/login", authRateLimiter, login);
router.post("/google", authRateLimiter, googleLogin);
router.post("/forgot-password", authRateLimiter, forgotPassword);
router.post("/reset-password", authRateLimiter, resetPassword);
router.post("/verify-otp", authRateLimiter, verifyOTP);
router.post("/refresh", refreshToken);

// ─── Protected Auth Routes ──────────────────────────────────────────────────
router.post("/logout", authMiddleware, logout);
router.get("/me", authMiddleware, getMe);
router.post("/change-password", authMiddleware, changePassword);
router.get("/security-logs", authMiddleware, getSecurityLogs);
router.post("/complete-onboarding", authMiddleware, completeOnboarding);

export default router;
