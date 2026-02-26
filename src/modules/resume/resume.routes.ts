import express from "express";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import { authMiddleware } from "../../middleware/auth.middleware";

export const resumeRouter = express.Router();

// Define Disk Storage for better security (renaming + storage outside public)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/resumes");
    },
    filename: (req, file, cb) => {
        // Rename file to prevent collisions and hide original name
        const uniqueSuffix = crypto.randomBytes(16).toString("hex");
        cb(null, `resume-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf|doc|docx|jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Error: File upload supports PDF, DOC, DOCX, and Image formats!"));
    },
});

import * as resumeController from "./resume.controller";

// Apply authMiddleware to protect resume uploads
resumeRouter.post("/scan", authMiddleware, upload.single("file"), resumeController.parseResume);

export default resumeRouter;
