"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateObjective = exports.getRoadmap = void 0;
const student_model_1 = __importDefault(require("../students/student.model"));
const user_model_1 = __importDefault(require("../users/user.model"));
const getRoadmap = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        let student = await student_model_1.default.findOne({ userId });
        const user = await user_model_1.default.findById(userId);
        if (!student && (user || req.user?.role === 'student')) {
            student = await student_model_1.default.create({
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
        // If roadmap already exists, return it
        if (student.roadmap && student.roadmap.length > 0) {
            return res.json({ roadmap: student.roadmap, objective: student.careerObjective });
        }
        // Otherwise generate a "next level" AI-driven roadmap
        const skills = student.skills || [];
        const objective = student.careerObjective || "Full Stack Developer";
        // Logic to generate dynamic steps based on skills
        const generatedRoadmap = [
            {
                id: 1,
                title: "Core Mastery",
                status: "completed",
                description: `Synthesizing your ${skills.length > 0 ? skills[0] : 'core'} foundations into professional-grade expertise.`,
                tasks: skills.length > 0 ? skills.slice(0, 3) : ["Data Structures", "Algorithms", "System Design"],
                progress: 100
            },
            {
                id: 2,
                title: `Elite ${objective} Specialization`,
                status: "in-progress",
                description: `Deep dive into advanced architectures tailored for your target goal of ${objective}.`,
                tasks: ["Performance Optimization", "Microservices Design", "Cloud Native Deployment"],
                progress: 45
            },
            {
                id: 3,
                title: "Professional Nexus",
                status: "locked",
                description: "Scaling your digital presence and portfolio for Tier-1 visibility.",
                tasks: ["Open Source Impact", "System Design Portfolio", "Technical Leadership Branding"],
                progress: 0
            },
            {
                id: 4,
                title: "Elite Arena Certification",
                status: "locked",
                description: "Final validation through high-pressure simulated technical rounds.",
                tasks: ["Live System Architecture", "FAANG Mock Circuits", "Behavioral Strategy Mastery"],
                progress: 0
            }
        ];
        // Save generated roadmap
        student.roadmap = generatedRoadmap;
        await student.save();
        return res.json({ roadmap: generatedRoadmap, objective });
    }
    catch (error) {
        console.error("ROADMAP ERROR:", error);
        return res.status(500).json({ message: "Failed to construct career roadmap" });
    }
};
exports.getRoadmap = getRoadmap;
const updateObjective = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { objective } = req.body;
        const student = await student_model_1.default.findOne({ userId });
        if (!student)
            return res.status(404).json({ message: "Student not found" });
        student.careerObjective = objective;
        // Reset roadmap to regenerate on next fetch
        student.roadmap = [];
        await student.save();
        return res.json({ message: "Objective aligned. Roadmap recalibrating..." });
    }
    catch (error) {
        return res.status(500).json({ message: "Alignment failed" });
    }
};
exports.updateObjective = updateObjective;
