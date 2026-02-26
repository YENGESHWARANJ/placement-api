"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postReply = exports.getDiscussions = exports.postDiscussion = exports.getExperiences = exports.postExperience = void 0;
const arena_model_1 = require("./arena.model");
const student_model_1 = __importDefault(require("../students/student.model"));
// ================================
// EXPERIENCE LOGIC
// ================================
const postExperience = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const student = await student_model_1.default.findOne({ userId });
        if (!student)
            return res.status(404).json({ message: "Student not found" });
        const experience = await arena_model_1.Experience.create({
            ...req.body,
            studentId: student._id
        });
        return res.status(201).json({ message: "Experience shared in The Arena", experience });
    }
    catch (error) {
        return res.status(500).json({ message: "Failed to post experience" });
    }
};
exports.postExperience = postExperience;
const getExperiences = async (req, res) => {
    try {
        const experiences = await arena_model_1.Experience.find()
            .populate("studentId", "name branch profilePicture")
            .sort({ createdAt: -1 });
        return res.json({ experiences });
    }
    catch (error) {
        return res.status(500).json({ message: "Failed to fetch experiences" });
    }
};
exports.getExperiences = getExperiences;
// ================================
// DISCUSSION LOGIC
// ================================
const postDiscussion = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const student = await student_model_1.default.findOne({ userId });
        if (!student)
            return res.status(404).json({ message: "Student not found" });
        const discussion = await arena_model_1.Discussion.create({
            ...req.body,
            studentId: student._id
        });
        return res.status(201).json({ message: "Discussion started", discussion });
    }
    catch (error) {
        return res.status(500).json({ message: "Failed to start discussion" });
    }
};
exports.postDiscussion = postDiscussion;
const getDiscussions = async (req, res) => {
    try {
        const discussions = await arena_model_1.Discussion.find()
            .populate("studentId", "name branch profilePicture")
            .populate("replies.studentId", "name profilePicture")
            .sort({ createdAt: -1 });
        return res.json({ discussions });
    }
    catch (error) {
        return res.status(500).json({ message: "Failed to fetch discussions" });
    }
};
exports.getDiscussions = getDiscussions;
const postReply = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;
        const { content } = req.body;
        const student = await student_model_1.default.findOne({ userId });
        if (!student)
            return res.status(404).json({ message: "Student not found" });
        const discussion = await arena_model_1.Discussion.findByIdAndUpdate(id, { $push: { replies: { studentId: student._id, content } } }, { new: true });
        return res.json({ message: "Reply added", discussion });
    }
    catch (error) {
        return res.status(500).json({ message: "Failed to post reply" });
    }
};
exports.postReply = postReply;
