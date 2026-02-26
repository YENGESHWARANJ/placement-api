import { Response } from "express";
import Application from "./application.model";
import Job from "../jobs/job.model";
import Student from "../students/student.model";
import User from "../users/user.model";
import { AuthRequest } from "../../middleware/auth.middleware";
import { sendNotification, broadcastGlobalEvent } from "../../config/socket.config";
import Notice from "../notices/notice.model";

// ================================
// APPLY FOR JOB (Student)
// ================================
export const applyForJob = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { jobId } = req.body;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Verify student
        const student = await Student.findOne({ userId });
        if (!student) {
            return res.status(403).json({ message: "Only students can apply" });
        }

        // Verify job
        const job = await Job.findOne({ _id: jobId, active: true });
        if (!job) {
            return res.status(404).json({ message: "Job not found or inactive" });
        }

        // Check if deadline passed
        if (job.deadline && new Date() > new Date(job.deadline)) {
            return res.status(400).json({ message: "Application deadline has passed" });
        }

        // Create application
        const application = await Application.create({
            jobId,
            studentId: student._id,
            status: "Applied",
            resumeUrl: student.resumeUrl
        });

        // NOTIFY RECRUITER
        sendNotification(job.recruiterId.toString(), {
            message: `New applicant for ${job.title}: ${student.name}`,
            type: "success"
        });

        // GLOBAL NOTIFICATION
        broadcastGlobalEvent("global_notification", {
            message: `🚀 Someone just applied for: ${job.title} at ${job.company}`,
            type: "info"
        });


        await Notice.create({
            title: "New Job Applicant",
            content: `${student.name} applied for your job: ${job.title}`,
            type: "Recruiter",
            priority: "Medium",
            targetUser: job.recruiterId,
            createdBy: userId
        });

        return res.status(201).json({
            message: "Application submitted successfully",
            application
        });
    } catch (error: any) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "You have already applied for this job" });
        }
        console.error("APPLY JOB ERROR:", error);
        return res.status(500).json({ message: "Failed to apply for job" });
    }
};


// ================================
// GET MY APPLICATIONS (Student)
// ================================
export const getMyApplications = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });
        let student = await Student.findOne({ userId });
        const user = await User.findById(userId);

        if (!student && (user || req.user?.role === 'student')) {
            student = await Student.create({
                userId: userId,
                name: user?.name || "Mock Student",
                usn: `MOCK_${userId.slice(-6).toUpperCase()}`,
                branch: "Engineering",
                year: 3,
                status: "Unplaced"
            });
            console.log(`[APP] Self-healed student profile for ID: ${userId}`);
        }

        if (!student) {
            return res.status(404).json({ message: "Student profile not found" });
        }

        const applications = await Application.find({ studentId: student._id })
            .populate("jobId", "title company location type salary")
            .sort({ createdAt: -1 });

        return res.json({ applications });
    } catch (error) {
        console.error("GET MY APPLICATIONS ERROR:", error);
        return res.status(500).json({ message: "Failed to fetch applications" });
    }
};

// ================================
// GET JOB APPLICANTS (Recruiter)
// ================================
export const getJobApplicants = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { jobId } = req.params;

        // Verify job ownership
        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ message: "Job not found" });

        if (job.recruiterId.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized access to these applicants" });
        }

        const applications = await Application.find({ jobId })
            .populate("studentId", "name usn branch cgpa skills email aptitudeScore codingScore interviewScore resumeScore about")
            .sort({ createdAt: -1 });

        // 🔥 LOGIC: Dynamic AI Matching
        const rankedApplications = applications.map(app => {
            const student = app.studentId as any;
            if (!student) return app;

            // Simplified ranking algorithm
            // 1. Technical Readiness (40%)
            const technicalScore = ((student.aptitudeScore || 0) + (student.codingScore || 0) + (student.interviewScore || 0)) / 3;

            // 2. Skill Match (40%)
            const matchingSkills = student.skills.filter((s: string) =>
                job.requirements.some((r: string) => r.toLowerCase().includes(s.toLowerCase()))
            );
            const skillScore = job.requirements.length > 0 ? (matchingSkills.length / job.requirements.length) * 100 : 50;

            // 3. Academic Benchmarking (20%)
            const academicScore = (student.cgpa / 10) * 100;

            const finalMatchScore = Math.round((technicalScore * 0.4) + (skillScore * 0.4) + (academicScore * 0.2));

            // Generate AI Insight
            let insight = "";
            if (finalMatchScore > 85) insight = "Elite Talent: Exceptional logic and skill alignment detected.";
            else if (finalMatchScore > 70) insight = "Strong Fit: Solid technical base with good profile convergence.";
            else insight = "Potential Match: Foundational skills present; needs interview verification.";

            return {
                ...app.toObject(),
                matchScore: finalMatchScore,
                aiInsights: insight
            };
        });

        // Sort by match score DESC
        rankedApplications.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

        return res.json({ applications: rankedApplications });
    } catch (error) {
        console.error("GET APPLICANTS ERROR:", error);
        return res.status(500).json({ message: "Failed to fetch applicants" });
    }
};

// ================================
// FAST TRACK APPLICANT (Recruiter)
// ================================
export const fastTrackApplicant = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;

        const application = await Application.findById(id).populate("jobId").populate("studentId");
        if (!application) return res.status(404).json({ message: "Application not found" });

        // @ts-ignore
        if (application.jobId.recruiterId.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        application.status = "Shortlisted";
        await application.save();

        // Send high-priority notification
        // @ts-ignore
        const studentUserId = application.studentId.userId.toString();
        // @ts-ignore
        const jobTitle = application.jobId.title;

        sendNotification(studentUserId, {
            message: `🔥 FAST-TRACKED! You have been shortlisted for ${jobTitle}. Prepare for the final rounds!`,
            type: "success"
        });

        await Notice.create({
            title: "Application Fast-Tracked!",
            content: `You have been shortlisted for ${jobTitle}. Prepare for the final rounds!`,
            type: "Student",
            priority: "High",
            createdBy: userId,
            targetUser: studentUserId
        });

        return res.json({ message: "Applicant fast-tracked", application });
    } catch (error) {
        console.error("FAST TRACK ERROR:", error);
        return res.status(500).json({ message: "Failed to fast-track" });
    }
};

// ================================
// UPDATE STATUS (Recruiter)
// ================================
export const updateApplicationStatus = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;
        const { status } = req.body;

        const application = await Application.findById(id).populate("jobId").populate("studentId");
        if (!application) return res.status(404).json({ message: "Application not found" });

        // Verify ownership via Job
        // @ts-ignore
        if (application.jobId.recruiterId.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        application.status = status;
        await application.save();

        // NOTIFY STUDENT
        // @ts-ignore
        const studentUserId = application.studentId.userId.toString();
        // @ts-ignore
        const jobTitle = application.jobId.title;

        sendNotification(studentUserId, {
            message: `Application Status Updated: ${jobTitle} -> ${status}`,
            type: status === "Selected" || status === "Shortlisted" ? "success" : "info"
        });

        await Notice.create({
            title: "Application Status Update",
            content: `Your application status for ${jobTitle} has been updated to: ${status}`,
            type: "Student",
            priority: status === "Selected" || status === "Shortlisted" ? "High" : "Medium",
            createdBy: userId,
            targetUser: studentUserId
        });

        return res.json({ message: "Status updated", application });
    } catch (error) {
        console.error("UPDATE STATUS ERROR:", error);
        return res.status(500).json({ message: "Failed to update status" });
    }
};

// ================================
// WITHDRAW APPLICATION (Student)
// ================================
export const withdrawApplication = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;

        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const student = await Student.findOne({ userId });
        if (!student) return res.status(403).json({ message: "Student profile not found" });

        const application = await Application.findById(id).populate("studentId");
        if (!application) return res.status(404).json({ message: "Application not found" });

        // @ts-ignore - studentId can be ObjectId or populated
        const appStudentId = application.studentId?._id?.toString() ?? application.studentId?.toString();
        if (appStudentId !== student._id.toString()) {
            return res.status(403).json({ message: "You can only withdraw your own application" });
        }

        application.status = "Withdrawn";
        await application.save();

        return res.json({ message: "Application withdrawn", application });
    } catch (error) {
        console.error("WITHDRAW APPLICATION ERROR:", error);
        return res.status(500).json({ message: "Failed to withdraw application" });
    }
};
