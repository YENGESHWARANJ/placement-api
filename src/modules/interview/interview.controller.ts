import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import Student from "../students/student.model";
import Application from "../applications/application.model";
import InterviewSession from "./interview-session.model";
import { sendNotification } from "../../config/socket.config";
import Notice from "../notices/notice.model";

// ==================================
// MOCK INTERVIEW LOGIC (Student)
// ==================================
export const generateQuestions = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ message: "Unauthenticated" });

        const student = await Student.findOne({ userId });

        // If no student profile exists, we default to generic questions
        const skills = student?.skills || [];

        // Dynamic question pool based on student skills
        const techQuestions: string[] = [];

        if (skills.some((s: string) => s.toLowerCase().includes("python"))) {
            techQuestions.push("How do you handle memory management in Python?", "What are decorators and how do they work?");
        }
        if (skills.some((s: string) => s.toLowerCase().includes("react"))) {
            techQuestions.push("Explain the Virtual DOM and its benefits.", "What is the difference between useMemo and useCallback?");
        }
        if (skills.some((s: string) => (s.toLowerCase().includes("javascript") || s.toLowerCase().includes("node")))) {
            techQuestions.push("Explain the event loop in Node.js.", "What is the difference between '==' and '==='?");
        }
        if (skills.some((s: string) => (s.toLowerCase().includes("sql") || s.toLowerCase().includes("database")))) {
            techQuestions.push("What is the difference between INNER JOIN and LEFT JOIN?", "Explain database normalization.");
        }

        // Generic HR questions
        const hrQuestions = [
            "Tell me about yourself.",
            "What are your strengths and weaknesses?",
            "Describe a difficult project you worked on and how you handled it.",
            "Where do you see yourself in 5 years?",
            "Why do you want to join our organization?"
        ];

        // Combine and pick 3 tech + 2 HR
        const finalQuestions = [
            ...techQuestions.sort(() => 0.5 - Math.random()).slice(0, 3),
            ...hrQuestions.sort(() => 0.5 - Math.random()).slice(0, 2)
        ];

        return res.json({
            success: true,
            questions: finalQuestions.length > 0 ? finalQuestions : hrQuestions.slice(0, 5)
        });

    } catch (error) {
        console.error("INTERVIEW ERROR:", error);
        return res.status(500).json({ message: "Failed to generate interview questions" });
    }
};

export const evaluateResponse = async (req: AuthRequest, res: Response) => {
    const { question, answer } = req.body;

    let feedback = "Good attempt. Try to be more specific with technical examples.";
    let score = 7;

    if (answer.length < 20) {
        feedback = "Your answer is too short. Try to explain with 'Situation, Task, Action, Result' (STAR) method.";
        score = 4;
    } else if (answer.toLowerCase().includes("always") || answer.toLowerCase().includes("never")) {
        feedback = "Avoid using absolute terms like 'always' or 'never'. Mention trade-offs instead.";
        score = 6;
    }

    return res.json({
        success: true,
        score,
        feedback
    });
};

// ==================================
// REAL INTERVIEW LOGIC (Recruiter)
// ==================================
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

        const interview = await InterviewSession.create({
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
        const studentUserId = (application.studentId as any).userId.toString();
        sendNotification(studentUserId, {
            message: `New Interview Scheduled! ${(application.jobId as any).title} at ${new Date(scheduledAt).toLocaleString()}`,
            type: "info"
        });

        await Notice.create({
            title: "Interview Scheduled",
            content: `You have a new interview scheduled for ${(application.jobId as any).title} at ${new Date(scheduledAt).toLocaleString()}`,
            type: "Student",
            priority: "High",
            createdBy: userId,
            targetUser: studentUserId
        });

        return res.status(201).json({ message: "Interview scheduled", interview });
    } catch (error) {
        console.error("SCHEDULE INTERVIEW ERROR:", error);
        return res.status(500).json({ message: "Failed to schedule interview" });
    }
};

export const submitFeedback = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;
        const { feedback } = req.body;

        const interview = await InterviewSession.findById(id).populate("studentId");
        if (!interview) return res.status(404).json({ message: "Interview not found" });

        if (interview.recruiterId.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        interview.feedback = feedback;
        interview.status = "Completed";

        const student = interview.studentId as any;
        const mockIQ = student.interviewScore || 0;
        const actualIQ = feedback.overallScore * 10;

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

export const getMyInterviews = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const role = req.user?.role;

        let query = {};
        if (role === 'recruiter') {
            query = { recruiterId: userId };
        } else {
            // Find student profile first
            const student = await Student.findOne({ userId });
            if (!student) return res.json({ interviews: [] });
            query = { studentId: student._id };
        }

        const interviews = await InterviewSession.find(query)
            .populate("jobId", "title company")
            .populate("studentId", "name branch email cgpa")
            .sort({ scheduledAt: 1 });

        return res.json({ interviews });
    } catch (error) {
        console.error("GET INTERVIEWS ERROR:", error);
        return res.status(500).json({ message: "Failed to fetch interviews" });
    }
};
