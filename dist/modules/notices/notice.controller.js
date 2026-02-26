"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotice = exports.getNotices = exports.createNotice = void 0;
const notice_model_1 = __importDefault(require("./notice.model"));
const createNotice = async (req, res) => {
    try {
        const { title, content, type, priority, targetUser } = req.body;
        const userId = req.user?.userId;
        if (!title || !content) {
            return res.status(400).json({ message: "Title and content are required" });
        }
        const notice = await notice_model_1.default.create({
            title,
            content,
            type: type || "All",
            priority: priority || "Low",
            createdBy: userId,
            targetUser: targetUser || undefined
        });
        return res.status(201).json({ message: "Notice posted successfully", notice });
    }
    catch (error) {
        console.error("CREATE NOTICE ERROR:", error);
        return res.status(500).json({ message: "Failed to post notice" });
    }
};
exports.createNotice = createNotice;
const getNotices = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const role = req.user?.role;
        const { type } = req.query;
        const filter = {
            $or: [
                { type: "All" },
                { targetUser: userId }
            ]
        };
        if (role === "student")
            filter.$or.push({ type: "Student" });
        if (role === "recruiter")
            filter.$or.push({ type: "Recruiter" });
        if (type && type !== "All") {
            filter.$or = filter.$or.filter((cond) => cond.type === type || cond.targetUser === userId);
        }
        const notices = await notice_model_1.default.find(filter)
            .sort({ createdAt: -1 })
            .populate("createdBy", "name")
            .populate("targetUser", "name");
        return res.json({ notices });
    }
    catch (error) {
        console.error("GET NOTICES ERROR:", error);
        return res.status(500).json({ message: "Failed to fetch notices" });
    }
};
exports.getNotices = getNotices;
const deleteNotice = async (req, res) => {
    try {
        const { id } = req.params;
        await notice_model_1.default.findByIdAndDelete(id);
        return res.json({ message: "Notice deleted successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: "Failed to delete notice" });
    }
};
exports.deleteNotice = deleteNotice;
