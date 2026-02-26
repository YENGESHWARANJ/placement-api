"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanResumeAndRank = void 0;
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const scanResumeAndRank = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Resume file missing" });
        }
        const file = req.file;
        const aiGatewayUrl = process.env.AI_GATEWAY_URL || process.env.AI_GATEWAY || "http://localhost:8000";
        const form = new form_data_1.default();
        form.append("file", file.buffer, file.originalname);
        // 👉 Resume parse
        const parseRes = await axios_1.default.post(`${aiGatewayUrl}/resume-parser`, form, {
            headers: form.getHeaders(),
        });
        const parsed = parseRes.data.parsed;
        // 👉 Rank (only if job skills provided)
        let ranking = null;
        if (req.body.jobSkills) {
            try {
                const rankRes = await axios_1.default.post(`${aiGatewayUrl}/ranking-engine`, {
                    candidateSkills: parsed.skills,
                    jobSkills: req.body.jobSkills,
                });
                ranking = rankRes.data;
            }
            catch (rankError) {
                console.error("Ranking failed (optional step):", rankError);
            }
        }
        return res.json({
            resume: parsed,
            ranking: ranking,
        });
    }
    catch (error) {
        console.error("AI scan failed:", error);
        return res.status(500).json({
            message: "AI scan failed. Ensure Python service is running.",
        });
    }
};
exports.scanResumeAndRank = scanResumeAndRank;
