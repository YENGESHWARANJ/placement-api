import mongoose, { Schema, Document, model } from "mongoose";

export interface IDrive extends Document {
    company: string;
    jobRole: string;
    date: Date;
    venue: string;
    salary: string;
    description: string;
    criterias: {
        cgpa: number;
        branches: string[];
        skills: string[];
    };
    status: 'Scheduled' | 'Completed' | 'Cancelled';
    rounds: string[];
    contactPerson: {
        name: string;
        email: string;
        phone: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const DriveSchema = new Schema<IDrive>(
    {
        company: { type: String, required: true },
        jobRole: { type: String, required: true },
        date: { type: Date, required: true },
        venue: { type: String, required: true },
        salary: { type: String },
        description: { type: String },
        criterias: {
            cgpa: { type: Number, default: 0 },
            branches: [{ type: String }],
            skills: [{ type: String }],
        },
        status: {
            type: String,
            enum: ['Scheduled', 'Completed', 'Cancelled'],
            default: 'Scheduled',
        },
        rounds: [{ type: String }],
        contactPerson: {
            name: String,
            email: String,
            phone: String,
        },
    },
    { timestamps: true }
);

const PlacementDrive = model<IDrive>("PlacementDrive", DriveSchema);
export default PlacementDrive;
