import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { getAlumniDirectory, requestMentorship } from "./alumni.controller";

const router = Router();

router.get("/directory", authMiddleware, getAlumniDirectory);
router.post("/request-mentorship", authMiddleware, requestMentorship);

export default router;
