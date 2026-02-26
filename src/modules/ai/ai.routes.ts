import { Router } from "express";
import multer from "multer";
import { scanResumeAndRank, chatWithAI, generateJob, chatWithCopilot, startVoiceInterview, replyVoiceInterview } from "./ai.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

// Authenticated route to allow saving to profile
router.post("/scan", authMiddleware, upload.single("file"), scanResumeAndRank);
router.post("/chat", authMiddleware, chatWithAI);
router.post("/copilot", authMiddleware, chatWithCopilot);
router.post("/generate-job", authMiddleware, generateJob);
router.post("/voice-interview/start", authMiddleware, startVoiceInterview);
router.post("/voice-interview/reply", authMiddleware, replyVoiceInterview);

export default router;
