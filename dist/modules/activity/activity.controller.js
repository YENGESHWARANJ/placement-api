"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyActivity = exports.logActivity = void 0;
const activity_model_1 = __importDefault(require("./activity.model"));
const logger_1 = __importDefault(require("../../utils/logger"));
// ================================
// CREATE ACTIVITY LOG (Internal utility)
// ================================
const logActivity = async (userId, action, description, metadata = {}) => {
    try {
        await activity_model_1.default.create({ userId, action, description, metadata });
    }
    catch (error) {
        logger_1.default.error(`Failed to log activity for user ${userId}: ${action}`, { error });
    }
};
exports.logActivity = logActivity;
// ================================
// GET MY ACTIVITY
// ================================
const getMyActivity = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const activities = await activity_model_1.default.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const totalOptions = await activity_model_1.default.countDocuments({ userId });
        return res.status(200).json({
            activities,
            totalPages: Math.ceil(totalOptions / limit),
            currentPage: page
        });
    }
    catch (error) {
        logger_1.default.error("GET MY ACTIVITY ERROR", { error });
        return res.status(500).json({ message: "Failed to fetch activity history" });
    }
};
exports.getMyActivity = getMyActivity;
