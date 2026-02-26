import { Router } from "express";
import { scheduleInterview, submitFeedback, getMyInterviews } from "./interview.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.post("/schedule", authMiddleware, scheduleInterview);
router.post("/:id/feedback", authMiddleware, submitFeedback);
router.get("/my", authMiddleware, getMyInterviews);

export default router;
