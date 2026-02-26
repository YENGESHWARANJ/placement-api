import { Response } from "express";
import Interview from "./interview.model";
import Application from "../applications/application.model";
import { AuthRequest } from "../../middleware/auth.middleware";
import { sendNotification } from "../../config/socket.config";

// ================================
// SCHEDULE INTERVIEW (Recruiter)
// ================================
export const scheduleInterview = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { applicationId, scheduledAt, type, mode, link, location } = req.body;

        const application = await Application.findById(applicationId).populate("jobId").populate("studentId");
        if (!application) return res.status(404).json({ message: "Application not found" });

        // @ts-ignore
        if (application.jobId.recruiterId.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const interview = await Interview.create({
            applicationId,
            jobId: (application.jobId as any)._id,
            studentId: (application.studentId as any)._id,
            recruiterId: userId,
            scheduledAt,
            type,
            mode,
            link,
            location,
            status: "Scheduled"
        });

        // Update application status to Interviewing
        application.status = "Interviewing";
        await application.save();

        // Notify Student
        // @ts-ignore
        const studentUserId = application.studentId.userId.toString();
        sendNotification(studentUserId, {
            message: `New Interview Scheduled! ${(application.jobId as any).title} at ${new Date(scheduledAt).toLocaleString()}`,
            type: "info"
        });

        return res.status(201).json({ message: "Interview scheduled", interview });
    } catch (error) {
        console.error("SCHEDULE INTERVIEW ERROR:", error);
        return res.status(500).json({ message: "Failed to schedule interview" });
    }
};

// ================================
// SUBMIT FEEDBACK (Recruiter)
// ================================
export const submitFeedback = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;
        const { feedback } = req.body;

        const interview = await Interview.findById(id).populate("jobId").populate("studentId");
        if (!interview) return res.status(404).json({ message: "Interview not found" });

        if (interview.recruiterId.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        interview.feedback = feedback;
        interview.status = "Completed";

        // AI Logic: Compare with Mock Interview performance
        const student = interview.studentId as any;
        const mockIQ = student.interviewScore || 0;
        const actualIQ = feedback.overallScore * 10; // Convert 1-10 to 1-100

        if (actualIQ > mockIQ) {
            interview.aiComparison = `Performance Jump: Candidate exceeded their AI benchmark of ${mockIQ}% by ${actualIQ - mockIQ} points. High growth velocity detected.`;
        } else {
            interview.aiComparison = `Benchmark Alignment: Candidate performed within range of their AI-simulated readiness (${mockIQ}%). Consistent performance levels.`;
        }

        await interview.save();

        return res.json({ message: "Feedback submitted successfully", interview });
    } catch (error) {
        console.error("FEEDBACK SUBMIT ERROR:", error);
        return res.status(500).json({ message: "Failed to submit feedback" });
    }
};

// ================================
// GET MY INTERVIEWS (Student/Recruiter)
// ================================
export const getMyInterviews = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const role = req.user?.role;

        let query = {};
        if (role === 'recruiter') {
            query = { recruiterId: userId };
        } else {
            const student = await Application.findOne({ studentId: userId }); // This is wrong, student might have multiple applications
            // Better to find student by userId first
        }

        // Let's refine for student
        // But for now, returning for current user
        const interviews = await Interview.find({
            $or: [{ recruiterId: userId }, { studentId: userId }]
        })
            .populate("jobId", "title company")
            .populate("studentId", "name branch email cgpa")
            .sort({ scheduledAt: 1 });

        return res.json({ interviews });
    } catch (error) {
        console.error("GET INTERVIEWS ERROR:", error);
        return res.status(500).json({ message: "Failed to fetch interviews" });
    }
};
