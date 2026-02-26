import { Schema, model, Document, Types, models } from "mongoose";

export interface IInterview extends Document {
    applicationId: Types.ObjectId;
    jobId: Types.ObjectId;
    studentId: Types.ObjectId;
    recruiterId: Types.ObjectId;
    scheduledAt: Date;
    type: "Technical" | "HR" | "Managerial" | "System Design";
    mode: "Virtual" | "In-Person";
    link?: string; // Meeting link
    location?: string;
    status: "Scheduled" | "Completed" | "Cancelled" | "No Show";
    feedback?: {
        logicScore: number;
        communicationScore: number;
        cultureFitScore: number;
        overallScore: number;
        comments: string;
        strengths: string[];
        weaknesses: string[];
    };
    aiComparison?: string; // AI's automated comparison with their Mock Interview results
}

const InterviewSchema = new Schema<IInterview>(
    {
        applicationId: { type: Schema.Types.ObjectId, ref: "Application", required: true },
        jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
        studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
        recruiterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        scheduledAt: { type: Date, required: true },
        type: {
            type: String,
            enum: ["Technical", "HR", "Managerial", "System Design"],
            default: "Technical"
        },
        mode: {
            type: String,
            enum: ["Virtual", "In-Person"],
            default: "Virtual"
        },
        link: { type: String },
        location: { type: String },
        status: {
            type: String,
            enum: ["Scheduled", "Completed", "Cancelled", "No Show"],
            default: "Scheduled"
        },
        feedback: {
            logicScore: { type: Number, default: 0 },
            communicationScore: { type: Number, default: 0 },
            cultureFitScore: { type: Number, default: 0 },
            overallScore: { type: Number, default: 0 },
            comments: { type: String, default: "" },
            strengths: { type: [String], default: [] },
            weaknesses: { type: [String], default: [] }
        },
        aiComparison: { type: String, default: "" }
    },
    { timestamps: true }
);

const Interview = models.Interview || model<IInterview>("Interview", InterviewSchema);

export default Interview;
