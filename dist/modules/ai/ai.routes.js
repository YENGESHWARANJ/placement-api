"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const ai_controller_1 = require("./ai.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
});
// Authenticated route to allow saving to profile
router.post("/scan", auth_middleware_1.authMiddleware, upload.single("file"), ai_controller_1.scanResumeAndRank);
router.post("/chat", auth_middleware_1.authMiddleware, ai_controller_1.chatWithAI);
router.post("/copilot", auth_middleware_1.authMiddleware, ai_controller_1.chatWithCopilot);
router.post("/generate-job", auth_middleware_1.authMiddleware, ai_controller_1.generateJob);
router.post("/voice-interview/start", auth_middleware_1.authMiddleware, ai_controller_1.startVoiceInterview);
router.post("/voice-interview/reply", auth_middleware_1.authMiddleware, ai_controller_1.replyVoiceInterview);
exports.default = router;
