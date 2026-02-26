"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const rateLimit_middleware_1 = require("../../middleware/rateLimit.middleware");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
// ─── Public Auth Routes (rate-limited) ─────────────────────────────────────
router.post("/register", rateLimit_middleware_1.authRateLimiter, auth_controller_1.register);
router.post("/login", rateLimit_middleware_1.authRateLimiter, auth_controller_1.login);
router.post("/google", rateLimit_middleware_1.authRateLimiter, auth_controller_1.googleLogin);
router.post("/forgot-password", rateLimit_middleware_1.authRateLimiter, auth_controller_1.forgotPassword);
router.post("/reset-password", rateLimit_middleware_1.authRateLimiter, auth_controller_1.resetPassword);
router.post("/verify-otp", rateLimit_middleware_1.authRateLimiter, auth_controller_1.verifyOTP);
router.post("/refresh", auth_controller_1.refreshToken);
// ─── Protected Auth Routes ──────────────────────────────────────────────────
router.post("/logout", auth_middleware_1.authMiddleware, auth_controller_1.logout);
router.get("/me", auth_middleware_1.authMiddleware, auth_controller_1.getMe);
router.post("/change-password", auth_middleware_1.authMiddleware, auth_controller_1.changePassword);
router.get("/security-logs", auth_middleware_1.authMiddleware, auth_controller_1.getSecurityLogs);
router.post("/complete-onboarding", auth_middleware_1.authMiddleware, auth_controller_1.completeOnboarding);
exports.default = router;
