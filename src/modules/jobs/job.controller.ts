import { Request, Response } from "express";
import axios from "axios";
import Job from "./job.model";
import { AuthRequest } from "../../middleware/auth.middleware";
import Student from "../students/student.model";
import Notice from "../notices/notice.model";
import { ENV } from "../../config/env.config";
import { logActivity } from "../activity/activity.controller";

// ================================
// CREATE JOB
// ================================

interface CreateJobBody {
    title: string;
    company: string;
    location: string;
    type: "Full-time" | "Internship" | "Contract";
    salary: string;
    description: string;
    requirements: string[];
    deadline: string;
}

export const createJob = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const {
            title,
            company,
            location,
            type,
            salary,
            description,
            requirements,
            deadline,
        } = req.body;

        const missingFields = [];
        if (!title) missingFields.push("title");
        if (!company) missingFields.push("company");
        if (!location) missingFields.push("location");
        if (!salary) missingFields.push("salary");
        if (!description) missingFields.push("description");
        // Logic fallback for deadline if missing
        const finalDeadline = deadline ? new Date(deadline) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        const job = await Job.create({
            recruiterId: userId,
            title,
            company,
            location,
            type,
            salary,
            description,
            requirements,
            deadline: finalDeadline,
        });

        await logActivity(userId!, "Posted Job", `Posted new job: ${title} at ${company}`);

        // Broadcast System Notice to all Students
        await Notice.create({
            title: `New Opportunity: ${title}`,
            content: `A new job opening at ${company} has just been posted. Log in to your dashboard to review the requirements and apply before the deadline.`,
            type: "Student",
            priority: "High",
            createdBy: userId
        });

        // Fire Real-Time Socket Event
        const io = req.app.get("io");
        if (io) {
            io.emit("global_notification", {
                title: `New Job Posted!`,
                message: `${title} at ${company}`,
                type: "success"
            });
        }

        return res.status(201).json({
            message: "Job posted successfully",
            job,
        });
    } catch (error) {
        console.error("CREATE JOB ERROR:", error);
        return res.status(500).json({
            message: "Failed to post job",
        });
    }
};

// ================================
// GET JOBS (WITH PAGINATION AND FILTERING)
// ================================
export const getJobs = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const search = req.query.search as string;
        const type = req.query.type as string;
        const location = req.query.location as string;

        const query: any = { active: true };

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { company: { $regex: search, $options: "i" } }
            ];
        }
        if (type && type !== "All") query.type = type;
        if (location && location !== "All") query.location = { $regex: location, $options: "i" };

        const jobs = await Job.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalItems = await Job.countDocuments(query);

        return res.status(200).json({
            jobs,
            totalPages: Math.ceil(totalItems / limit),
            currentPage: page,
            totalItems
        });
    } catch (error) {
        console.error("GET JOBS ERROR:", error);
        return res.status(500).json({
            message: "Failed to fetch jobs",
        });
    }
};

export const getCompanies = async (req: Request, res: Response) => {
    try {
        // Find unique companies from active jobs
        const companies = await Job.aggregate([
            { $match: { active: true, company: { $exists: true, $ne: null, $type: "string" } } },
            {
                $group: {
                    _id: "$company",
                    industry: { $first: "$type" },
                    location: { $first: "$location" },
                    jobsCount: { $sum: 1 },
                    description: { $first: "$description" }
                }
            },
            {
                $project: {
                    name: "$_id",
                    industry: 1,
                    location: 1,
                    jobs: "$jobsCount",
                    description: 1,
                    rating: { $literal: 4.8 },
                    hiringStatus: { $literal: "Active" },
                    logo: { $substrCP: ["$_id", 0, 1] }
                }
            }
        ]);

        return res.json({ companies });
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch companies" });
    }
};

// ================================
// GET MY JOBS (WITH PAGINATION AND FILTERING)
// ================================
export const getMyJobs = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const search = req.query.search as string;
        const matchStage: any = { recruiterId: userId };

        if (search) {
            matchStage.$or = [
                { title: { $regex: search, $options: "i" } },
                { company: { $regex: search, $options: "i" } }
            ];
        }

        // Fetch jobs with applicant counts
        const jobs = await Job.aggregate([
            { $match: matchStage },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: "applications",
                    localField: "_id",
                    foreignField: "jobId",
                    as: "applications"
                }
            },
            {
                $addFields: {
                    applicantsCount: { $size: "$applications" }
                }
            },
            {
                $project: {
                    applications: 0 // Remove the applications array from output
                }
            }
        ]);

        const totalDocsAgg = await Job.aggregate([
            { $match: matchStage },
            { $count: "total" }
        ]);
        const totalItems = totalDocsAgg.length > 0 ? totalDocsAgg[0].total : 0;

        return res.status(200).json({
            jobs,
            totalPages: Math.ceil(totalItems / limit),
            currentPage: page,
            totalItems
        });
    } catch (error) {
        console.error("GET MY JOBS ERROR:", error);
        return res.status(500).json({
            message: "Failed to fetch your jobs",
        });
    }
};

// ================================
// GET RECOMMENDED JOBS (AI Based on Skills)
// ================================
export const getRecommendedJobs = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;

        // ✅ Safe check for valid ObjectId strings (prevent 500 CastError)
        if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
            console.warn(`[JOBS] Invalid or Mock userId detected: ${userId}. Returning default jobs.`);
            const jobs = await Job.find({ active: true }).sort({ createdAt: -1 }).limit(10);
            return res.json({
                message: "Using default recommendations (Login with a real account for AI matching)",
                jobs
            });
        }

        const student = await Student.findOne({ userId });

        if (!student || !student.skills || student.skills.length === 0) {
            // No skills -> Just return recent jobs
            const jobs = await Job.find({ active: true }).sort({ createdAt: -1 }).limit(10);
            return res.json({
                message: "Add skills to your profile for better recommendations",
                jobs
            });
        }

        // Find all active jobs
        const allJobs = await Job.find({ active: true });

        // Prepare payload for AI Service
        const jobsPayload = allJobs.map(job => ({
            _id: job._id,
            title: job.title,
            company: job.company,
            location: job.location,
            type: job.type,
            salary: job.salary,
            skills: job.requirements || [], // Map requirements to "skills" for the AI
            requirements: job.requirements // Keep requirements for frontend display
        }));

        const aiGatewayUrl = ENV.AI_GATEWAY_URL;

        try {
            // Typed response for AI service
            const { data } = await axios.post<{ ranked_jobs: any[] }>(`${aiGatewayUrl}/rank-jobs`, {
                candidateSkills: student.skills,
                jobs: jobsPayload
            });

            // AI Service returns sorted list with matchScore
            const topJobs = data.ranked_jobs.slice(0, 10).map(job => ({
                ...job,
                skills: job.skills || job.requirements || []
            }));

            return res.json({
                jobs: topJobs
            });


        } catch (aiError) {
            console.error("AI Service Ranking Failed, falling back to basic logic", aiError);

            // FALLBACK LOGIC (Simple JS Matching)
            const skillsArray = Array.isArray(student.skills) ? student.skills : [];
            const studentSkills = new Set(skillsArray.map((s: any) => String(s).toLowerCase()));

            const rankedJobs = allJobs.map((job) => {
                const requirements = job.requirements || [];
                if (requirements.length === 0) return { job, score: 0 };

                let matchCount = 0;
                // Explicitly typing 'req' as string
                requirements.forEach((req: string) => {
                    if (studentSkills.has(req.toLowerCase())) {
                        matchCount++;
                    }
                });

                const score = (matchCount / requirements.length) * 100;
                return { job, score };
            });

            rankedJobs.sort((a, b) => b.score - a.score);

            const topJobs = rankedJobs.slice(0, 10).map(item => ({
                ...item.job.toObject(),
                matchScore: Math.round(item.score),
                skills: item.job.requirements || []
            }));

            return res.json({ jobs: topJobs });

        }

    } catch (error) {
        console.error("GET RECOMMENDED JOBS ERROR:", error);
        return res.status(500).json({
            message: "Failed to fetch recommendations",
        });
    }
};

// ================================
// GET JOB BY ID
// ================================
export const getJobById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Validate ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid Job ID" });
        }

        const job = await Job.findById(id);

        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        return res.status(200).json({ job });
    } catch (error) {
        console.error("GET JOB BY ID ERROR:", error);
        return res.status(500).json({ message: "Failed to fetch job details" });
    }
};

// ================================
// DELETE JOB
// ================================
export const deleteJob = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        const job = await Job.findById(id);

        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        if (job.recruiterId.toString() !== userId) {
            return res.status(403).json({ message: "You can only delete your own jobs" });
        }

        const title = job.title;
        await job.deleteOne();
        await logActivity(userId!, "Deleted Job", `Deleted job: ${title}`);

        return res.status(200).json({ message: "Job deleted successfully" });
    } catch (error) {
        console.error("DELETE JOB ERROR:", error);
        return res.status(500).json({ message: "Failed to delete job" });
    }
};

// ================================
// UPDATE JOB
// ================================
export const updateJob = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        const job = await Job.findById(id);

        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        if (job.recruiterId.toString() !== userId) {
            return res.status(403).json({ message: "You can only update your own jobs" });
        }

        // Allow updates
        Object.assign(job, req.body);

        await job.save();
        await logActivity(userId!, "Updated Job", `Updated details for job: ${job.title}`);

        return res.status(200).json({ message: "Job updated successfully", job });
    } catch (error) {
        console.error("UPDATE JOB ERROR:", error);
        return res.status(500).json({ message: "Failed to update job" });
    }
};
