import { Router } from "express";
import { createJob, getJobs, getRecommendedJobs, deleteJob, updateJob, getMyJobs, getCompanies, getJobById } from "./job.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.post("/", authMiddleware, createJob);
router.get("/", getJobs);
router.get("/companies", getCompanies);
router.get("/my", authMiddleware, getMyJobs); // New route
router.get("/recommendations", authMiddleware, getRecommendedJobs);
// Job fetching with ID
router.get("/:id", getJobById);
router.delete("/:id", authMiddleware, deleteJob);
router.put("/:id", authMiddleware, updateJob);

export default router;
