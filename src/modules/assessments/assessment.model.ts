import { Schema, model, Document, Types, models } from "mongoose";

export interface IAssessment extends Document {
    studentId: Types.ObjectId;
    type: "Aptitude" | "Coding" | "Interview";
    title: string;
    score: number;
    totalQuestions: number;
    timeTaken: number; // in seconds
    results: any[]; // topic-wise correct/wrong
    topicAnalysis: {
        topic: string;
        score: number;
        total: number;
    }[];
    status: "Completed" | "In-Progress";
    createdAt: Date;
}

const AssessmentSchema = new Schema<IAssessment>({
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    type: { type: String, enum: ["Aptitude", "Coding", "Interview"], required: true },
    title: { type: String, required: true },
    score: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    timeTaken: { type: Number, default: 0 },
    results: [Schema.Types.Mixed],
    topicAnalysis: [{
        topic: String,
        score: Number,
        total: Number
    }],
    status: { type: String, enum: ["Completed", "In-Progress"], default: "Completed" }
}, { timestamps: true });

const Assessment = models.Assessment || model<IAssessment>("Assessment", AssessmentSchema);
export default Assessment;
