import { Router } from "express";
import {
    getAllRecruiters,
    updateRecruiterStatus,
    getAllJobsAdmin,
    manageJobStatus,
    getAllTests,
    deleteStudent,
    updateStudentStatus
} from "./admin.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { rbacMiddleware } from "../../middleware/rbac.middleware";
import { UserRole } from "../auth/auth.types";

const router = Router();

// All admin routes require admin or officer role
router.use(authMiddleware, rbacMiddleware([UserRole.ADMIN, UserRole.OFFICER]));

// Student Management (Admin)
router.delete("/students/:id", deleteStudent);
router.put("/students/:id/status", updateStudentStatus);

// Recruiter Management
router.get("/recruiters", getAllRecruiters);
router.put("/recruiters/:id/status", updateRecruiterStatus);

// Job Management
router.get("/jobs", getAllJobsAdmin);
router.put("/jobs/:id/status", manageJobStatus);

// Test/Assessment Management
router.get("/tests", getAllTests);

export default router;
