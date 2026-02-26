import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import axios from "axios";
import { ENV } from "../../config/env.config";
import Student from "../students/student.model";
import FormData from "form-data";
import { GoogleGenAI } from "@google/genai";

// Multer adds file to Request
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const pdfParse = require("pdf-parse");

export const scanResumeAndRank = async (
  req: MulterRequest,
  res: Response
) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume file missing" });
    }

    if (!aiClient) {
      return res.status(500).json({
        success: false,
        message: "GEMINI_API_KEY is not configured.",
      });
    }

    const fileBuffer = req.file.buffer;
    let rawText = "";

    try {
      const pdfData = await pdfParse(fileBuffer);
      rawText = pdfData.text;
    } catch (err) {
      return res.status(400).json({ message: "Failed to read PDF file." });
    }

    const systemPrompt = `You are an expert ATS (Applicant Tracking System) and AI Recruiter. 
Extract the following information from the provided resume text and return it STRICTLY as a valid JSON object. Do NOT wrap it in markdown blockquotes like \`\`\`json. Just yield the raw JSON string.

Expected JSON Structure:
{
  "resume": {
    "name": "Full Name or null",
    "email": "Email address or null",
    "phone": "Phone number or null",
    "skills": ["Array of distinct technical or soft skills"],
    "education": ["Array of education entries"],
    "experience": ["Array of string descriptions of work experience"],
    "projects": ["Array of projects"]
  },
  "ranking": {
    "score": 85, // estimate out of 100 based on modern tech standards
    "match_percentage": 85, 
    "missing_skills": ["2-3 highly demanded skills missing from this resume"],
    "matched_skills": ["2-3 top skills found"],
    "feedback": ["Array of 3 actionable short tips to improve the resume"]
  }
}

Resume Text:
${rawText.substring(0, 10000)}
`;

    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
    });

    let jsonStr = response.text || "{}";
    jsonStr = jsonStr.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsedData = JSON.parse(jsonStr);

    // Add raw preview
    parsedData.resume.rawPreview = rawText.substring(0, 500) + "...";

    return res.json({
      success: true,
      data: parsedData
    });
  } catch (error) {
    console.error("AI scan failed:", error);
    return res.status(500).json({
      message: "AI scan failed. Ensure API credits and model availability.",
    });
  }
};

let aiClient: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
} catch (e) {
  console.error("Failed to initialize GoogleGenAI:", e);
}

export const chatWithAI = async (req: AuthRequest, res: Response) => {
  try {
    const { query } = req.body;
    const userId = req.user?.userId;

    const student = await Student.findOne({ userId });

    const context = {
      role: req.user?.role || "student",
      resumeScore: student?.resumeScore || 0,
      objective: student?.careerObjective || "Technology",
      skills: student?.skills || []
    };

    const systemPrompt = `You are the PlacementCell AI Coach. You are an expert career counselor, tech interviewer, and resume reviewer.
You are helping a ${context.role}.
Their career objective: ${context.objective}.
Their skills: ${context.skills.join(', ') || 'Not specified'}.
Keep answers extremely concise, encouraging, and actionable. Use bullet points where appropriate. Maximum 3 paragraphs.`;

    if (!aiClient) {
      throw new Error("GEMINI_API_KEY is missing or invalid on the server.");
    }

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: "Understood. I am ready to help." }] },
        { role: 'user', parts: [{ text: query }] }
      ],
    });

    return res.json({
      success: true,
      response: response.text
    });

  } catch (error) {
    console.error("AI CHAT ERROR:", error);
    return res.status(500).json({ message: "AI Chat failed" });
  }
};

export const chatWithCopilot = async (req: AuthRequest, res: Response) => {
  try {
    const { message } = req.body;
    const userId = req.user?.userId;

    const student = await Student.findOne({ userId });

    const context = {
      role: req.user?.role || "student",
      name: student?.name || "User",
      resumeScore: student?.resumeScore || 0,
      aptitudeScore: student?.aptitudeScore || 0,
      codingScore: student?.codingScore || 0,
      interviewScore: student?.interviewScore || 0,
      cgpa: student?.cgpa || 0,
      skills: student?.skills || [],
    };

    const systemPrompt = `You are Nexus Copilot, the AI assistant for PlaceIQ. 
You are talking to ${context.name}, a ${context.role}.
Their Skills: ${context.skills.join(', ') || 'Not specified'}.
Their Metrics: CGPA (${context.cgpa}), Coding Score (${context.codingScore}), Aptitude Score (${context.aptitudeScore}), Interview Score (${context.interviewScore}), Resume Score (${context.resumeScore}).
Provide personalized, actionable advice focusing on helping them improve their metrics and secure a job. Be conversational, encouraging, and extremely concise. Limit responses to 2 short paragraphs or a few bullet points. Use emojis sparingly.`;

    if (!aiClient) {
      throw new Error("GEMINI_API_KEY is missing or invalid on the server.");
    }

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: "Understood. I'm ready to assist as Nexus Copilot." }] },
        { role: 'user', parts: [{ text: message }] }
      ],
    });

    return res.json({
      success: true,
      reply: response.text
    });

  } catch (error) {
    console.error("COPILOT CHAT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Intelligence module temporarily offline",
      response: "I'm having trouble connecting to my core brain right now. Please try again in a moment."
    });
  }
};

export const generateJob = async (req: AuthRequest, res: Response) => {
  try {
    const { title } = req.body;
    const aiGatewayUrl = ENV.AI_GATEWAY_URL;

    const { data } = await axios.post<any>(`${aiGatewayUrl}/generate-job`, { title });
    return res.json(data);
  } catch (error) {
    console.error("GENERATE JOB ERROR:", error);
    return res.status(500).json({ message: "AI Generator offline" });
  }
};

export const startVoiceInterview = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const student = await Student.findOne({ userId });

    const context = {
      name: student?.name || "Candidate",
      role: req.user?.role || "student",
      skills: student?.skills || [],
    };

    const introMessage = `Hello ${context.name}. I am your AI Interviewer. I see you have skills in ${context.skills.join(', ') || 'various technologies'}. Are you ready to begin our technical interview?`;

    return res.json({
      success: true,
      message: introMessage
    });
  } catch (error) {
    console.error("VOICE INTERVIEW START ERROR:", error);
    return res.status(500).json({ message: "Failed to initialize interview" });
  }
};

export const replyVoiceInterview = async (req: AuthRequest, res: Response) => {
  try {
    const { message, history } = req.body;
    const userId = req.user?.userId;

    if (!aiClient) {
      throw new Error("GEMINI_API_KEY is missing or invalid on the server.");
    }

    const systemPrompt = `You are a strict but fair Technical AI Interviewer. 
Your goal is to assess the candidate's technical skills based on their responses. 
Keep your responses conversational, spoken-word friendly (no markdown, no code blocks, just plain text), and very brief (max 2-3 sentences).
Ask one logical follow-up question per response. Validate their previous answer briefly before asking the next question.`;

    const chatHistory = Array.isArray(history) ? history.map((h: any) => ({
      role: h.role === 'ai' || h.role === 'model' ? 'model' : 'user',
      parts: Array.isArray(h.parts) ? h.parts : [{ text: h.text || '' }]
    })) : [];

    const contents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: "Understood. I will act as the oral technical interviewer." }] },
      ...chatHistory,
      { role: 'user', parts: [{ text: message }] }
    ];

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents
    });

    const reply = response.text?.replace(/[\*\#\`]/g, '') || "I didn't quite catch that. Could you elaborate?";

    return res.json({
      success: true,
      reply
    });

  } catch (error) {
    console.error("VOICE INTERVIEW REPLY ERROR:", error);
    return res.status(500).json({ message: "Failed to process interview response" });
  }
};
