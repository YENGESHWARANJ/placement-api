import { Request, Response } from "express";
import Notice from "./notice.model";
import { AuthRequest } from "../../middleware/auth.middleware";

export const createNotice = async (req: AuthRequest, res: Response) => {
    try {
        const { title, content, type, priority, targetUser } = req.body;
        const userId = req.user?.userId;

        if (!title || !content) {
            return res.status(400).json({ message: "Title and content are required" });
        }

        const notice = await Notice.create({
            title,
            content,
            type: type || "All",
            priority: priority || "Low",
            createdBy: userId,
            targetUser: targetUser || undefined
        });

        return res.status(201).json({ message: "Notice posted successfully", notice });
    } catch (error) {
        console.error("CREATE NOTICE ERROR:", error);
        return res.status(500).json({ message: "Failed to post notice" });
    }
};

export const getNotices = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const role = req.user?.role;
        const { type } = req.query;

        const filter: any = {
            $or: [
                { type: "All" },
                { targetUser: userId }
            ]
        };

        if (role === "student") filter.$or.push({ type: "Student" });
        if (role === "recruiter") filter.$or.push({ type: "Recruiter" });

        if (type && type !== "All") {
            filter.$or = filter.$or.filter((cond: any) => cond.type === type || cond.targetUser === userId);
        }

        const notices = await Notice.find(filter)
            .sort({ createdAt: -1 })
            .populate("createdBy", "name")
            .populate("targetUser", "name");

        return res.json({ notices });
    } catch (error) {
        console.error("GET NOTICES ERROR:", error);
        return res.status(500).json({ message: "Failed to fetch notices" });
    }
};

export const deleteNotice = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        await Notice.findByIdAndDelete(id);
        return res.json({ message: "Notice deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Failed to delete notice" });
    }
};
