import { Router } from "express";
import {
    postExperience,
    getExperiences,
    postDiscussion,
    getDiscussions,
    postReply
} from "./arena.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.post("/experience", authMiddleware, postExperience);
router.get("/experience", authMiddleware, getExperiences);

router.post("/discussion", authMiddleware, postDiscussion);
router.get("/discussion", authMiddleware, getDiscussions);
router.post("/discussion/:id/reply", authMiddleware, postReply);

export default router;
