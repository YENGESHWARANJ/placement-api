import { Router } from "express";
import { applyForJob, getMyApplications, getJobApplicants, updateApplicationStatus, fastTrackApplicant, withdrawApplication } from "./application.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

// Student
router.post("/", authMiddleware, applyForJob); // Apply (jobId in body)
router.get("/my", authMiddleware, getMyApplications); // Get my applications
router.patch("/:id/withdraw", authMiddleware, withdrawApplication); // Withdraw own application

// Recruiter
router.get("/job/:jobId", authMiddleware, getJobApplicants); // Get applicants for a job
router.put("/:id", authMiddleware, updateApplicationStatus); // Update status
router.post("/:id/fast-track", authMiddleware, fastTrackApplicant); // Fast track assessment winner

export default router;
