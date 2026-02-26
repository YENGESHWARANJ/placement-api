import { Schema, model, Document, Types, models } from "mongoose";

export interface IApplication extends Document {
    jobId: Types.ObjectId;
    studentId: Types.ObjectId;
    status: "Applied" | "Shortlisted" | "Interviewing" | "Rejected" | "Selected";
    resumeUrl?: string;
    appliedAt: Date;
    matchScore?: number;
    aiInsights?: string;
}

const ApplicationSchema = new Schema<IApplication>(
    {
        jobId: {
            type: Schema.Types.ObjectId,
            ref: "Job",
            required: true,
        },
        studentId: {
            type: Schema.Types.ObjectId,
            ref: "Student", // Link to Student model
            required: true,
        },
        status: {
            type: String,
            enum: ["Applied", "Shortlisted", "Interviewing", "Rejected", "Selected"],
            default: "Applied",
        },
        resumeUrl: {
            type: String, // Optional URL if they want to use a specific resume version
        },
        matchScore: {
            type: Number,
            default: 0
        },
        aiInsights: {
            type: String,
            default: ""
        },
        appliedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate applications
ApplicationSchema.index({ jobId: 1, studentId: 1 }, { unique: true });

const Application = models.Application || model<IApplication>("Application", ApplicationSchema);

export default Application;
