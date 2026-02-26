import mongoose, { Schema, Document } from "mongoose";

export interface IResource extends Document {
    title: string;
    description: string;
    url: string;
    category: string;
    tags: string[];
    type: "video" | "article" | "course" | "documentation" | "tool";
    difficulty: "beginner" | "intermediate" | "advanced";
    featured: boolean;
    rating: number;
    createdAt: Date;
    updatedAt: Date;
}

const ResourceSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        url: { type: String, required: true },
        category: { type: String, required: true },
        tags: [{ type: String }],
        type: {
            type: String,
            enum: ["video", "article", "course", "documentation", "tool"],
            default: "article"
        },
        difficulty: {
            type: String,
            enum: ["beginner", "intermediate", "advanced"],
            default: "beginner"
        },
        featured: { type: Boolean, default: false },
        rating: { type: Number, default: 4.5, min: 0, max: 5 }
    },
    { timestamps: true }
);

export default mongoose.model<IResource>("Resource", ResourceSchema);
