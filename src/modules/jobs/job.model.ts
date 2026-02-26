import { Schema, model, Document, Types, models } from "mongoose";

export interface IJob extends Document {
    recruiterId: Types.ObjectId;
    title: string;
    company: string;
    location: string;
    type: "Full-time" | "Internship" | "Contract";
    salary: string;
    description: string;
    requirements: string[];
    deadline: Date;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
    {
        recruiterId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        company: {
            type: String,
            required: true,
            trim: true,
        },
        location: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["Full-time", "Internship", "Contract"],
            default: "Full-time",
        },
        salary: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        requirements: {
            type: [String],
            default: [],
        },
        deadline: {
            type: Date,
            required: true,
        },
        active: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const Job = models.Job || model<IJob>("Job", JobSchema);

export default Job;
