"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const student_controller_1 = require("./student.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const auth_types_1 = require("../auth/auth.types");
const router = (0, express_1.Router)();
router.get("/profile", auth_middleware_1.authMiddleware, student_controller_1.getProfile);
router.get("/saved-jobs", auth_middleware_1.authMiddleware, student_controller_1.getSavedJobs);
router.post("/saved-jobs", auth_middleware_1.authMiddleware, student_controller_1.addSavedJob);
router.delete("/saved-jobs/:jobId", auth_middleware_1.authMiddleware, student_controller_1.removeSavedJob);
// Registration doesn't need auth (public signup)
router.post("/register", student_controller_1.registerStudent);
// Only Admin and Recruiter can view all students
router.get("/", auth_middleware_1.authMiddleware, (0, rbac_middleware_1.rbacMiddleware)([auth_types_1.UserRole.ADMIN, auth_types_1.UserRole.RECRUITER, auth_types_1.UserRole.OFFICER]), student_controller_1.getStudents);
// Leaderboard - Accessible to everyone with auth
router.get("/leaderboard", auth_middleware_1.authMiddleware, student_controller_1.getLeaderboard);
router.get("/online", auth_middleware_1.authMiddleware, student_controller_1.getOnlineStudents);
// Get specific student profile (Recruiters/Admins)
router.get("/:id", auth_middleware_1.authMiddleware, (0, rbac_middleware_1.rbacMiddleware)([auth_types_1.UserRole.ADMIN, auth_types_1.UserRole.RECRUITER, auth_types_1.UserRole.OFFICER]), student_controller_1.getStudentById);
// Students can update their own profile
router.post("/profile", auth_middleware_1.authMiddleware, (0, rbac_middleware_1.rbacMiddleware)([auth_types_1.UserRole.STUDENT]), student_controller_1.updateProfile);
exports.default = router;
