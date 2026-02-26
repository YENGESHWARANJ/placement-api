"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("./admin.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const auth_types_1 = require("../auth/auth.types");
const router = (0, express_1.Router)();
// All admin routes require admin or officer role
router.use(auth_middleware_1.authMiddleware, (0, rbac_middleware_1.rbacMiddleware)([auth_types_1.UserRole.ADMIN, auth_types_1.UserRole.OFFICER]));
// Student Management (Admin)
router.delete("/students/:id", admin_controller_1.deleteStudent);
router.put("/students/:id/status", admin_controller_1.updateStudentStatus);
// Recruiter Management
router.get("/recruiters", admin_controller_1.getAllRecruiters);
router.put("/recruiters/:id/status", admin_controller_1.updateRecruiterStatus);
// Job Management
router.get("/jobs", admin_controller_1.getAllJobsAdmin);
router.put("/jobs/:id/status", admin_controller_1.manageJobStatus);
// Test/Assessment Management
router.get("/tests", admin_controller_1.getAllTests);
exports.default = router;
