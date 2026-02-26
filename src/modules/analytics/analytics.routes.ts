import { Router } from "express";
import { getAdminStats, getRecruiterStats, getStudentStats, exportAdminReport, getSystemHealth } from "./analytics.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.get("/admin-stats", authMiddleware, getAdminStats);
router.get("/recruiter-stats", authMiddleware, getRecruiterStats);
router.get("/student-stats", authMiddleware, getStudentStats);
router.get("/export-report", authMiddleware, exportAdminReport);
router.get("/system-health", authMiddleware, getSystemHealth);

export default router;
