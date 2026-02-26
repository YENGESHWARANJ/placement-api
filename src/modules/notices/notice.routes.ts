import { Router } from "express";
import { createNotice, getNotices, deleteNotice } from "./notice.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.get("/", authMiddleware, getNotices);
router.post("/", authMiddleware, createNotice);
router.delete("/:id", authMiddleware, deleteNotice);

export default router;
