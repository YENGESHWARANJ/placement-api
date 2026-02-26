"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const assessment_controller_1 = require("./assessment.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
// AI Question Generation
router.get("/ai/generate", auth_middleware_1.authMiddleware, assessment_controller_1.generateAIQuestions);
router.get("/topics", auth_middleware_1.authMiddleware, assessment_controller_1.getTopics);
// Legacy / existing
router.get("/questions", auth_middleware_1.authMiddleware, assessment_controller_1.getQuestions);
router.post("/save", auth_middleware_1.authMiddleware, assessment_controller_1.saveAssessment);
router.get("/my-results", auth_middleware_1.authMiddleware, assessment_controller_1.getStudentAssessments);
exports.default = router;
