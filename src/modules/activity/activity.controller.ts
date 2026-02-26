import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import ActivityLog from "./activity.model";
import logger from "../../utils/logger";

// ================================
// CREATE ACTIVITY LOG (Internal utility)
// ================================
export const logActivity = async (userId: string, action: string, description: string, metadata: object = {}) => {
    try {
        await ActivityLog.create({ userId, action, description, metadata });
    } catch (error) {
        logger.error(`Failed to log activity for user ${userId}: ${action}`, { error });
    }
};

// ================================
// GET MY ACTIVITY
// ================================
export const getMyActivity = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const activities = await ActivityLog.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalOptions = await ActivityLog.countDocuments({ userId });

        return res.status(200).json({
            activities,
            totalPages: Math.ceil(totalOptions / limit),
            currentPage: page
        });
    } catch (error) {
        logger.error("GET MY ACTIVITY ERROR", { error });
        return res.status(500).json({ message: "Failed to fetch activity history" });
    }
};
