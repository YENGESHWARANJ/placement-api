import { Router } from "express";
import {
    getQuestions,
    generateAIQuestions,
    getTopics,
    saveAssessment,
    getStudentAssessments
} from "./assessment.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

// AI Question Generation
router.get("/ai/generate", authMiddleware, generateAIQuestions);
router.get("/topics", authMiddleware, getTopics);

// Legacy / existing
router.get("/questions", authMiddleware, getQuestions);
router.post("/save", authMiddleware, saveAssessment);
router.get("/my-results", authMiddleware, getStudentAssessments);

export default router;
