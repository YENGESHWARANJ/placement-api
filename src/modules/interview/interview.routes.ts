import { Router } from "express";
import {
    generateQuestions,
    evaluateResponse,
    scheduleInterview,
    submitFeedback,
    getMyInterviews
} from "./interview.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

// Student (Mock)
router.get("/questions", authMiddleware, generateQuestions);
router.post("/evaluate", authMiddleware, evaluateResponse);

// Recruiter/Student (Real)
router.post("/schedule", authMiddleware, scheduleInterview);
router.post("/:id/feedback", authMiddleware, submitFeedback);
router.get("/my", authMiddleware, getMyInterviews);

export default router;
