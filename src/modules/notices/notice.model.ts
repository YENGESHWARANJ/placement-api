import { Schema, model, Document, Types, models } from "mongoose";

export interface INotice extends Document {
    title: string;
    content: string;
    createdBy: Types.ObjectId;
    targetUser?: Types.ObjectId;
    type: "All" | "Student" | "Recruiter";
    priority: "Low" | "Medium" | "High";
    createdAt: Date;
    updatedAt: Date;
}

const NoticeSchema = new Schema<INotice>(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
        createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        targetUser: { type: Schema.Types.ObjectId, ref: "User", required: false },
        type: { type: String, enum: ["All", "Student", "Recruiter"], default: "All" },
        priority: { type: String, enum: ["Low", "Medium", "High"], default: "Low" },
    },
    { timestamps: true }
);

const Notice = models.Notice || model<INotice>("Notice", NoticeSchema);
export default Notice;
