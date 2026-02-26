import { Router } from "express";
import { getRoadmap, updateObjective } from "./roadmap.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.get("/", authMiddleware, getRoadmap);
router.post("/align", authMiddleware, updateObjective);

export default router;
