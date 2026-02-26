import { Schema, model, Document, Types, models } from "mongoose";

export interface IExperience extends Document {
    studentId: Types.ObjectId;
    company: string;
    role: string;
    date: Date;
    difficulty: "Easy" | "Medium" | "Hard";
    verdict: "Selected" | "Rejected" | "Waitlisted";
    roundWiseDetails: {
        roundName: string;
        details: string;
    }[];
    tips: string;
    likes: number;
    createdAt: Date;
}

const ExperienceSchema = new Schema<IExperience>(
    {
        studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
        company: { type: String, required: true },
        role: { type: String, required: true },
        date: { type: Date, default: Date.now },
        difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
        verdict: { type: String, enum: ["Selected", "Rejected", "Waitlisted"] },
        roundWiseDetails: [{
            roundName: String,
            details: String
        }],
        tips: { type: String },
        likes: { type: Number, default: 0 }
    },
    { timestamps: true }
);

export const Experience = models.Experience || model<IExperience>("Experience", ExperienceSchema);

export interface IDiscussion extends Document {
    studentId: Types.ObjectId;
    title: string;
    content: string;
    tags: string[];
    likes: number;
    replies: {
        studentId: Types.ObjectId;
        content: string;
        createdAt: Date;
    }[];
    createdAt: Date;
}

const DiscussionSchema = new Schema<IDiscussion>(
    {
        studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
        title: { type: String, required: true },
        content: { type: String, required: true },
        tags: { type: [String], default: [] },
        likes: { type: Number, default: 0 },
        replies: [{
            studentId: { type: Schema.Types.ObjectId, ref: "Student" },
            content: String,
            createdAt: { type: Date, default: Date.now }
        }]
    },
    { timestamps: true }
);

export const Discussion = models.Discussion || model<IDiscussion>("Discussion", DiscussionSchema);
