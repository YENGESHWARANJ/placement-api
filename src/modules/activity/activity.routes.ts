import { Router } from "express";
import { getMyActivity } from "./activity.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.get("/my-activity", authMiddleware, getMyActivity);

export default router;
