import { Response } from "express";
import { Experience, Discussion } from "./arena.model";
import Student from "../students/student.model";
import { AuthRequest } from "../../middleware/auth.middleware";

// ================================
// EXPERIENCE LOGIC
// ================================
export const postExperience = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const student = await Student.findOne({ userId });
        if (!student) return res.status(404).json({ message: "Student not found" });

        const experience = await Experience.create({
            ...req.body,
            studentId: student._id
        });

        return res.status(201).json({ message: "Experience shared in The Arena", experience });
    } catch (error) {
        return res.status(500).json({ message: "Failed to post experience" });
    }
};

export const getExperiences = async (req: AuthRequest, res: Response) => {
    try {
        const experiences = await Experience.find()
            .populate("studentId", "name branch profilePicture")
            .sort({ createdAt: -1 });
        return res.json({ experiences });
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch experiences" });
    }
};

// ================================
// DISCUSSION LOGIC
// ================================
export const postDiscussion = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const student = await Student.findOne({ userId });
        if (!student) return res.status(404).json({ message: "Student not found" });

        const discussion = await Discussion.create({
            ...req.body,
            studentId: student._id
        });

        return res.status(201).json({ message: "Discussion started", discussion });
    } catch (error) {
        return res.status(500).json({ message: "Failed to start discussion" });
    }
};

export const getDiscussions = async (req: AuthRequest, res: Response) => {
    try {
        const discussions = await Discussion.find()
            .populate("studentId", "name branch profilePicture")
            .populate("replies.studentId", "name profilePicture")
            .sort({ createdAt: -1 });
        return res.json({ discussions });
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch discussions" });
    }
};

export const postReply = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;
        const { content } = req.body;

        const student = await Student.findOne({ userId });
        if (!student) return res.status(404).json({ message: "Student not found" });

        const discussion = await Discussion.findByIdAndUpdate(
            id,
            { $push: { replies: { studentId: student._id, content } } },
            { new: true }
        );

        return res.json({ message: "Reply added", discussion });
    } catch (error) {
        return res.status(500).json({ message: "Failed to post reply" });
    }
};
