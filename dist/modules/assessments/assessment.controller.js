"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentAssessments = exports.saveAssessment = exports.getQuestions = exports.getTopics = exports.generateAIQuestions = void 0;
const axios_1 = __importDefault(require("axios"));
const env_config_1 = require("../../config/env.config");
const assessment_model_1 = __importDefault(require("./assessment.model"));
const student_model_1 = __importDefault(require("../students/student.model"));
const socket_config_1 = require("../../config/socket.config");
const questionBank_1 = require("./questionBank");
// ─────────────────────────────────────────────────────────
// AI GENERATE QUESTIONS (Now calls AI Service)
// ─────────────────────────────────────────────────────────
const generateAIQuestions = async (req, res) => {
    try {
        const { type, topic, difficulty, count = 10 } = req.query;
        const numCount = Math.min(Number(count), 20);
        try {
            // Attempt to call AI Gateway
            const aiResponse = await axios_1.default.post(`${env_config_1.ENV.AI_GATEWAY_URL}/generate-questions`, {
                type,
                topic: topic || "General",
                difficulty: difficulty || "medium",
                count: numCount
            });
            const data = aiResponse.data;
            if (data && data.success) {
                return res.json({
                    success: true,
                    type: type || "Full Assessment",
                    generated: true,
                    aiGenerated: true,
                    topic: topic || "Mixed",
                    difficulty: difficulty || "mixed",
                    questions: data.questions
                });
            }
        }
        catch (aiError) {
            console.warn("AI Gateway unreachable, falling back to local bank");
        }
        // --- FALLBACK LOGIC ---
        if (type === "Aptitude") {
            const questions = (0, questionBank_1.getRandomQuestions)(questionBank_1.aptitudeBank, numCount, topic, difficulty).map((q, idx) => ({ ...q, id: idx + 1 }));
            return res.json({
                success: true,
                type: "Aptitude",
                generated: true,
                topic: topic || "Mixed",
                difficulty: difficulty || "mixed",
                questions
            });
        }
        if (type === "Coding") {
            const questions = (0, questionBank_1.getRandomQuestions)(questionBank_1.codingBank, Math.min(numCount, 5), topic, difficulty).map((q, idx) => ({ ...q, id: idx + 1 }));
            return res.json({
                success: true,
                type: "Coding",
                generated: true,
                topic: topic || "Mixed",
                difficulty: difficulty || "Mixed",
                questions
            });
        }
        if (type === "Interview") {
            const questions = (0, questionBank_1.getRandomQuestions)(questionBank_1.interviewBank, numCount, topic, difficulty).map((q, idx) => ({ ...q, id: idx + 1 }));
            return res.json({
                success: true,
                type: "Interview",
                generated: true,
                topic: topic || "Mixed",
                difficulty: difficulty || "mixed",
                questions
            });
        }
        // Mixed Set
        const apts = (0, questionBank_1.getRandomQuestions)(questionBank_1.aptitudeBank, 5).map((q, i) => ({ ...q, id: i + 1, assessmentType: "Aptitude" }));
        const codes = (0, questionBank_1.getRandomQuestions)(questionBank_1.codingBank, 2).map((q, i) => ({ ...q, id: i + 1, assessmentType: "Coding" }));
        return res.json({
            success: true,
            type: "Full Assessment",
            generated: true,
            questions: [...apts, ...codes]
        });
    }
    catch (error) {
        console.error("AI GENERATE QUESTIONS ERROR:", error);
        return res.status(500).json({ message: "Assessment engine offline" });
    }
};
exports.generateAIQuestions = generateAIQuestions;
// ─────────────────────────────────────────────────────────
// GET TOPICS (for topic selector UI)
// ─────────────────────────────────────────────────────────
const getTopics = async (_req, res) => {
    const aptitudeTopics = [...new Set(questionBank_1.aptitudeBank.map(q => q.topic))];
    const codingTopics = [...new Set(questionBank_1.codingBank.map(q => q.topic))];
    const interviewCategories = [...new Set(questionBank_1.interviewBank.map(q => q.category))];
    return res.json({
        aptitude: aptitudeTopics,
        coding: codingTopics,
        interview: interviewCategories
    });
};
exports.getTopics = getTopics;
// ─────────────────────────────────────────────────────────
// LEGACY — kept for backward compat
// ─────────────────────────────────────────────────────────
const getQuestions = async (req, res) => {
    const { type } = req.query;
    // Now uses real bank instead of hardcoded 3 questions
    if (type === "Aptitude") {
        const questions = (0, questionBank_1.getRandomQuestions)(questionBank_1.aptitudeBank, 10).map((q, i) => ({ ...q, id: i + 1 }));
        return res.json({ questions });
    }
    if (type === "Coding") {
        const questions = (0, questionBank_1.getRandomQuestions)(questionBank_1.codingBank, 1);
        return res.json({ questions });
    }
    if (type === "Interview") {
        const questions = (0, questionBank_1.getRandomQuestions)(questionBank_1.interviewBank, 10).map((q, i) => ({ ...q, id: i + 1 }));
        return res.json({ questions });
    }
    return res.json({ questions: [] });
};
exports.getQuestions = getQuestions;
// ─────────────────────────────────────────────────────────
// SAVE ASSESSMENT
// ─────────────────────────────────────────────────────────
const saveAssessment = async (req, res) => {
    try {
        const { type, score, totalQuestions, results, topicAnalysis, timeTaken } = req.body;
        const userId = req.user?.userId || req.user?.id;
        const student = await student_model_1.default.findOne({ userId });
        if (!student)
            return res.status(404).json({ message: "Student not found" });
        const assessment = new assessment_model_1.default({
            studentId: student._id,
            type,
            title: `${type} Assessment - ${new Date().toLocaleDateString()}`,
            score,
            totalQuestions,
            results,
            topicAnalysis,
            timeTaken
        });
        await assessment.save();
        // Update student score (weighted average)
        const percentage = Math.round((score / totalQuestions) * 100);
        if (type === "Aptitude") {
            student.aptitudeScore = Math.round(((student.aptitudeScore || 0) + percentage) / 2);
        }
        else if (type === "Coding") {
            student.codingScore = Math.round(((student.codingScore || 0) + percentage) / 2);
        }
        else if (type === "Interview") {
            student.interviewScore = Math.round(((student.interviewScore || 0) + percentage) / 2);
        }
        await student.save();
        if (percentage >= 80) {
            (0, socket_config_1.broadcastGlobalEvent)("global_notification", {
                message: `🏆 ${student.name} just scored ${percentage}% on the ${type} Assessment!`,
                type: "success"
            });
        }
        return res.json({ message: "Assessment saved successfully", assessment });
    }
    catch (error) {
        console.error("SAVE ASSESSMENT ERROR:", error);
        return res.status(500).json({ message: "Failed to save assessment" });
    }
};
exports.saveAssessment = saveAssessment;
// ─────────────────────────────────────────────────────────
// GET STUDENT ASSESSMENTS
// ─────────────────────────────────────────────────────────
const getStudentAssessments = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        const student = await student_model_1.default.findOne({ userId });
        if (!student)
            return res.status(404).json({ message: "Student not found" });
        const assessments = await assessment_model_1.default.find({ studentId: student._id }).sort({ createdAt: -1 });
        return res.json({ assessments });
    }
    catch (error) {
        return res.status(500).json({ message: "Failed to fetch assessments" });
    }
};
exports.getStudentAssessments = getStudentAssessments;
