import { Router } from "express";
import { registerStudent, getStudents, updateProfile, getProfile, getStudentById, getSavedJobs, addSavedJob, removeSavedJob, getLeaderboard, getOnlineStudents } from "./student.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { rbacMiddleware } from "../../middleware/rbac.middleware";
import { UserRole } from "../auth/auth.types";

const router = Router();

router.get("/profile", authMiddleware, getProfile);

router.get("/saved-jobs", authMiddleware, getSavedJobs);
router.post("/saved-jobs", authMiddleware, addSavedJob);
router.delete("/saved-jobs/:jobId", authMiddleware, removeSavedJob);

// Registration doesn't need auth (public signup)
router.post("/register", registerStudent);

// Only Admin and Recruiter can view all students
router.get("/", authMiddleware, rbacMiddleware([UserRole.ADMIN, UserRole.RECRUITER, UserRole.OFFICER]), getStudents);

// Leaderboard - Accessible to everyone with auth
router.get("/leaderboard", authMiddleware, getLeaderboard);

router.get("/online", authMiddleware, getOnlineStudents);

// Get specific student profile (Recruiters/Admins)
router.get("/:id", authMiddleware, rbacMiddleware([UserRole.ADMIN, UserRole.RECRUITER, UserRole.OFFICER]), getStudentById);

// Students can update their own profile
router.post("/profile", authMiddleware, rbacMiddleware([UserRole.STUDENT]), updateProfile);

export default router;
