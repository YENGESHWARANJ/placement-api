import { Request, Response } from "express";
import axios from "axios";
import FormData from "form-data";

// Multer adds file to Request
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export const scanResumeAndRank = async (
  req: MulterRequest,
  res: Response
) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume file missing" });
    }

    const file = req.file;
    const aiGatewayUrl = process.env.AI_GATEWAY_URL || process.env.AI_GATEWAY || "http://localhost:8000";

    const form = new FormData();
    form.append("file", file.buffer, file.originalname);

    // 👉 Resume parse
    const parseRes = await axios.post<{
      parsed: {
        name?: string;
        email?: string;
        phone?: string;
        skills: string[];
        experience?: string[];
        rawPreview?: string;
      };
    }>(
      `${aiGatewayUrl}/resume-parser`,
      form,
      {
        headers: form.getHeaders(),
      }
    );

    const parsed = parseRes.data.parsed;

    // 👉 Rank (only if job skills provided)
    let ranking = null;
    if (req.body.jobSkills) {
      try {
        const rankRes = await axios.post(
          `${aiGatewayUrl}/ranking-engine`,
          {
            candidateSkills: parsed.skills,
            jobSkills: req.body.jobSkills,
          }
        );
        ranking = rankRes.data;
      } catch (rankError) {
        console.error("Ranking failed (optional step):", rankError);
      }
    }

    return res.json({
      resume: parsed,
      ranking: ranking,
    });
  } catch (error) {
    console.error("AI scan failed:", error);

    return res.status(500).json({
      message: "AI scan failed. Ensure Python service is running.",
    });
  }
};
