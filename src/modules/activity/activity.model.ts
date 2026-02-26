import { Schema, model, Document, Types, models } from "mongoose";

export interface IActivityLog extends Document {
    userId: Types.ObjectId;
    action: string;
    description: string;
    metadata?: object;
    createdAt: Date;
    updatedAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        action: { type: String, required: true },
        description: { type: String, required: true },
        metadata: { type: Object, default: {} },
    },
    { timestamps: true }
);

// Index for performance
ActivityLogSchema.index({ userId: 1, createdAt: -1 });

const ActivityLog = models.ActivityLog || model<IActivityLog>("ActivityLog", ActivityLogSchema);
export default ActivityLog;
