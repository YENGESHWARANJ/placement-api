"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const application_controller_1 = require("./application.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Student
router.post("/", auth_middleware_1.authMiddleware, application_controller_1.applyForJob); // Apply (jobId in body)
router.get("/my", auth_middleware_1.authMiddleware, application_controller_1.getMyApplications); // Get my applications
router.patch("/:id/withdraw", auth_middleware_1.authMiddleware, application_controller_1.withdrawApplication); // Withdraw own application
// Recruiter
router.get("/job/:jobId", auth_middleware_1.authMiddleware, application_controller_1.getJobApplicants); // Get applicants for a job
router.put("/:id", auth_middleware_1.authMiddleware, application_controller_1.updateApplicationStatus); // Update status
router.post("/:id/fast-track", auth_middleware_1.authMiddleware, application_controller_1.fastTrackApplicant); // Fast track assessment winner
exports.default = router;
