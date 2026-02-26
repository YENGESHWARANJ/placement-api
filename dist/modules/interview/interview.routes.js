"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const interview_controller_1 = require("./interview.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Student (Mock)
router.get("/questions", auth_middleware_1.authMiddleware, interview_controller_1.generateQuestions);
router.post("/evaluate", auth_middleware_1.authMiddleware, interview_controller_1.evaluateResponse);
// Recruiter/Student (Real)
router.post("/schedule", auth_middleware_1.authMiddleware, interview_controller_1.scheduleInterview);
router.post("/:id/feedback", auth_middleware_1.authMiddleware, interview_controller_1.submitFeedback);
router.get("/my", auth_middleware_1.authMiddleware, interview_controller_1.getMyInterviews);
exports.default = router;
