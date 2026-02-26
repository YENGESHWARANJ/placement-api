import { Request, Response } from "express";
import User, { UserRole } from "../users/user.model";
import Job from "../jobs/job.model";
import Student from "../students/student.model";
import Assessment from "../assessments/assessment.model";
import Application from "../applications/application.model";

// --- RECRUITER MANAGEMENT ---

export const getAllRecruiters = async (req: Request, res: Response) => {
    try {
        const recruiters = await User.find({ role: UserRole.RECRUITER })
            .select("-password")
            .sort({ createdAt: -1 });

        // Enrich with job counts
        const enrichedRecruiters = await Promise.all(recruiters.map(async (recruiter) => {
            const activeJobs = await Job.countDocuments({ recruiterId: recruiter._id, status: 'Active' });
            return {
                ...recruiter.toObject(),
                activeJobs
            };
        }));

        return res.json({ recruiters: enrichedRecruiters });
    } catch (error) {
        console.error("GET RECRUITERS ERROR:", error);
        return res.status(500).json({ message: "Failed to fetch recruiters" });
    }
};

export const updateRecruiterStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'active', 'rejected', 'suspended'

        if (!['active', 'rejected', 'suspended', 'pending'].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const recruiter = await User.findByIdAndUpdate(id, { status }, { new: true }).select("-password");
        if (!recruiter) return res.status(404).json({ message: "Recruiter not found" });

        return res.json({ message: `Recruiter status updated to ${status}`, recruiter });
    } catch (error) {
        console.error("UPDATE RECRUITER STATUS ERROR:", error);
        return res.status(500).json({ message: "Failed to update status" });
    }
};

// --- JOB MANAGEMENT ---

export const getAllJobsAdmin = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;
        const search = req.query.search as string;

        const query: any = {};
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { company: { $regex: search, $options: "i" } }
            ];
        }

        const jobs = await Job.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);

        // Enrich with applicant counts
        const enrichedJobs = await Promise.all(jobs.map(async (job) => {
            const applicantsCount = await Application.countDocuments({ jobId: job._id });
            return {
                ...job.toObject(),
                applicantsCount
            };
        }));

        const totalItems = await Job.countDocuments(query);

        return res.json({
            jobs: enrichedJobs,
            totalPages: Math.ceil(totalItems / limit),
            currentPage: page,
            totalItems
        });
    } catch (error) {
        console.error("GET ALL JOBS ADMIN ERROR:", error);
        return res.status(500).json({ message: "Failed to fetch jobs" });
    }
};

export const manageJobStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'active', 'closed', 'completed'

        const job = await Job.findByIdAndUpdate(id, { status }, { new: true });
        if (!job) return res.status(404).json({ message: "Job not found" });

        return res.json({ message: "Job status updated", job });
    } catch (error) {
        console.error("MANAGE JOB ERROR:", error);
        return res.status(500).json({ message: "Failed to update job" });
    }
};

// --- STUDENT MANAGEMENT ---

export const deleteStudent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const student = await Student.findById(id);
        if (!student) return res.status(404).json({ message: "Student not found" });

        // Delete user first, then student
        await User.findByIdAndDelete(student.userId);
        await Student.findByIdAndDelete(id);

        return res.json({ message: "Student and user account deleted" });
    } catch (error) {
        console.error("DELETE STUDENT ERROR:", error);
        return res.status(500).json({ message: "Failed to delete student" });
    }
};

export const updateStudentStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const student = await Student.findByIdAndUpdate(id, { isActive }, { new: true });
        if (!student) return res.status(404).json({ message: "Student not found" });

        return res.json({ message: `Student account ${isActive ? 'enabled' : 'disabled'}`, student });
    } catch (error) {
        console.error("UPDATE STUDENT STATUS ERROR:", error);
        return res.status(500).json({ message: "Failed to update status" });
    }
};

// --- TEST MANAGEMENT ---
// (Assessments already have controllers, but admin might need to see all)
export const getAllTests = async (req: Request, res: Response) => {
    try {
        const tests = await Assessment.find().sort({ createdAt: -1 });
        return res.json({ tests });
    } catch (error) {
        console.error("GET ALL TESTS ERROR:", error);
        return res.status(500).json({ message: "Failed to fetch tests" });
    }
};
