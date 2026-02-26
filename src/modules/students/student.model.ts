import { Schema, model, Document, Types, models } from "mongoose";

export interface IStudent extends Document {
  userId: Types.ObjectId;
  recruiterId?: Types.ObjectId;
  name: string;
  usn: string;
  branch: string;
  year: number;
  cgpa: number;
  status: "Placed" | "Unplaced" | "Offers Received";
  company?: string;
  skills: string[];
  resumeScore?: number;
  aptitudeScore?: number;
  codingScore?: number;
  interviewScore?: number;
  careerObjective?: string;
  roadmap?: {
    id: number;
    title: string;
    status: "completed" | "in-progress" | "locked";
    description: string;
    tasks: string[];
    progress: number;
  }[];
  about?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  profilePicture?: string;
  savedJobIds?: Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    recruiterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false // For now
    },

    // Linked User
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    usn: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },

    branch: {
      type: String, // Department
      required: true,
    },

    year: {
      type: Number,
      required: true,
    },

    cgpa: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Placed", "Unplaced", "Offers Received"],
      default: "Unplaced",
    },

    company: {
      type: String,
      default: null,
    },

    skills: {
      type: [String],
      default: [],
    },
    resumeScore: {
      type: Number,
      default: 0,
    },
    aptitudeScore: {
      type: Number,
      default: 0,
    },
    codingScore: {
      type: Number,
      default: 0,
    },
    interviewScore: {
      type: Number,
      default: 0,
    },
    careerObjective: {
      type: String,
      default: "Full Stack Developer",
    },
    roadmap: {
      type: [
        {
          id: Number,
          title: String,
          status: { type: String, enum: ["completed", "in-progress", "locked"] },
          description: String,
          tasks: [String],
          progress: Number,
        },
      ],
      default: [],
    },
    about: {
      type: String,
      default: "",
    },
    linkedin: {
      type: String,
      default: "",
    },
    github: {
      type: String,
      default: "",
    },
    website: {
      type: String,
      default: "",
    },
    profilePicture: {
      type: String,
      default: "",
    },
    savedJobIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "Job" }],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Student =
  models.Student || model<IStudent>("Student", StudentSchema);

export default Student;
