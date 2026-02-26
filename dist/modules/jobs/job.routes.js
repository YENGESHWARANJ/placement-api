"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const job_controller_1 = require("./job.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post("/", auth_middleware_1.authMiddleware, job_controller_1.createJob);
router.get("/", job_controller_1.getJobs);
router.get("/companies", job_controller_1.getCompanies);
router.get("/my", auth_middleware_1.authMiddleware, job_controller_1.getMyJobs); // New route
router.get("/recommendations", auth_middleware_1.authMiddleware, job_controller_1.getRecommendedJobs);
// Job fetching with ID
router.get("/:id", job_controller_1.getJobById);
router.delete("/:id", auth_middleware_1.authMiddleware, job_controller_1.deleteJob);
router.put("/:id", auth_middleware_1.authMiddleware, job_controller_1.updateJob);
exports.default = router;
