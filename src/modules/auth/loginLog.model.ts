import { Schema, model, Document, Types, models } from "mongoose";

export interface ILoginLog extends Document {
    userId: Types.ObjectId;
    action: string;
    timestamp: Date;
    location: string;
    device: string;
    ip?: string;
    status: "success" | "warning" | "danger";
}

const LoginLogSchema = new Schema<ILoginLog>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    location: { type: String, default: "Unknown" },
    device: { type: String, default: "Unknown" },
    ip: { type: String, default: null },
    status: { type: String, enum: ["success", "warning", "danger"], default: "success" }
}, { timestamps: true });

export const LoginLog = models.LoginLog || model<ILoginLog>("LoginLog", LoginLogSchema);
