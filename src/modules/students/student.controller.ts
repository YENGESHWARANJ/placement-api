import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { UserRole } from "../auth/auth.types";
import { generateAccessToken } from "../auth/auth.service";
import User from "../users/user.model";
import Student from "./student.model";
import Job from "../jobs/job.model";
import { AuthRequest } from "../../middleware/auth.middleware";
import { logActivity } from "../activity/activity.controller";
import { onlineUsers } from "../../config/socket.config";

// ... existing code ...

interface RegisterStudentBody {
  email: string;
  password: string;
  name: string;
  skills?: string[];
  branch: string;
  year: number;
  usn: string;
  cgpa?: number;
  status?: string;
  company?: string;
}

export const registerStudent = async (
  req: Request<{}, {}, RegisterStudentBody>,
  res: Response
) => {
  // ... existing registerStudent logic ...
  // (I will keep the existing logic but just adding the new function at the end)
  try {
    const {
      email,
      password,
      name,
      skills = [],
      branch,
      year,
      usn,
      cgpa,
      status,
      company
    } = req.body;

    if (!email || !password || !name || !branch || !year || !usn) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: UserRole.STUDENT,
    });

    const student = await Student.create({
      userId: user._id,
      name,
      skills,
      branch,
      year,
      usn,
      cgpa,
      status,
      company
    });

    const token = generateAccessToken({
      userId: user._id.toString(),
      role: user.role,
    });

    return res.status(201).json({
      message: "Student registered successfully",
      token,
      student,
    });
  } catch (error) {
    console.error("REGISTER STUDENT ERROR:", error);
    return res.status(500).json({
      message: "Registration failed",
    });
  }
};

export const getStudents = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const search = req.query.search as string;
    const branch = req.query.branch as string;
    const status = req.query.status as string;

    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { usn: { $regex: search, $options: "i" } },
        { skills: { $regex: search, $options: "i" } }
      ];
    }
    if (branch && branch !== "All") query.branch = branch;
    if (status && status !== "All") query.status = status;

    const students = await Student.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const totalItems = await Student.countDocuments(query);

    return res.status(200).json({
      students,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      totalItems
    });
  } catch (error) {
    console.error("GET STUDENTS ERROR:", error);
    return res.status(500).json({
      message: "Failed to fetch students",
    });
  }
};

export const getOnlineStudents = async (req: Request, res: Response) => {
  try {
    const onlineUserIds = Array.from(onlineUsers);
    return res.json({ onlineUserIds });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch online statuses" });
  }
};

export const getStudentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid Student ID" });
    }

    const student = await Student.findById(id).populate('userId', 'email role');

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.json({ student });
  } catch (error) {
    console.error("GET STUDENT BY ID ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch student profile" });
  }
};

// ================================
// CREATE OR UPDATE PROFILE (From Resume)
// ================================
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // ✅ Safe check for valid ObjectId strings (prevent 500 CastError from mock users)
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(200).json({
        success: true,
        message: "Running in mock mode. Profile changes not persisted in DB.",
        data: { ...req.body, _id: userId }
      });
    }

    const {
      skills, name, resumeScore,
      branch, year, usn, cgpa, status, company,
      about, linkedin, github, website, profilePicture
    } = req.body;

    let student = await Student.findOne({ userId });

    if (student) {
      if (name) {
        student.name = name;
        await User.findByIdAndUpdate(userId, { name });
      }
      if (skills) student.skills = skills;
      if (resumeScore !== undefined) student.resumeScore = resumeScore;
      if (branch) student.branch = branch;
      if (year) student.year = year;
      if (usn) student.usn = usn;
      if (cgpa !== undefined) student.cgpa = cgpa;
      if (status) student.status = status;
      if (company !== undefined) student.company = company;

      // New fields
      if (about !== undefined) student.about = about;
      if (linkedin !== undefined) student.linkedin = linkedin;
      if (github !== undefined) student.github = github;
      if (website !== undefined) student.website = website;
      if (profilePicture !== undefined) student.profilePicture = profilePicture;

      await student.save();
    } else {
      const user = await User.findById(userId);

      student = await Student.create({
        userId,
        name: name || user?.name || "Student",
        usn: usn || "PENDING-" + userId.toString().substring(0, 6).toUpperCase(),
        branch: branch || "General",
        year: year || 2025,
        skills: skills || [],
        resumeScore: resumeScore || 0,
        cgpa: cgpa || 0,
        status: status || "Unplaced",
        company: company || null,
        about: about || "",
        linkedin: linkedin || "",
        github: github || "",
        website: website || "",
        profilePicture: profilePicture || ""
      });
    }

    await logActivity(userId!, "Update Profile", "Updated Student Profile Details");

    return res.status(200).json({
      success: true,
      message: "Profile updated",
      data: student
    });

  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to update profile" });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    // ✅ Safe check for valid ObjectId strings
    if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.json({
        success: true,
        data: {
          name: "Mock Student",
          email: "mock@gmail.com",
          skills: ["JavaScript", "React"],
          status: "Unplaced"
        }
      });
    }

    let student = await Student.findOne({ userId });

    // If student doesn't exist, create a shell or return empty
    if (!student) {
      const user = await User.findById(userId);
      return res.json({
        success: true,
        data: {
          name: user?.name || "Student",
          email: user?.email,
          skills: [],
          status: "Unplaced"
        }
      });
    }

    return res.json({ success: true, data: student });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ================================
// SAVED JOBS
// ================================
export const getSavedJobs = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const student = await Student.findOne({ userId }).populate("savedJobIds", "title company location type salary");
    const list = (student?.savedJobIds || []) as any[];
    const savedJobs = list.map((j) => ({
      id: j._id?.toString(),
      title: j.title || "Untitled",
      company: j.company || "Unknown",
      location: j.location || "Remote",
      type: j.type || "Full-time",
      salary: j.salary || "Negotiable"
    }));
    return res.json({ savedJobs });
  } catch (error) {
    console.error("GET SAVED JOBS ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch saved jobs" });
  }
};

export const addSavedJob = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { jobId } = req.body;
    if (!userId || !jobId) return res.status(400).json({ message: "jobId required" });

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    let student = await Student.findOne({ userId });
    if (!student) return res.status(404).json({ message: "Student profile not found" });

    if (!student.savedJobIds) student.savedJobIds = [];
    if (student.savedJobIds.some((id: any) => id.toString() === jobId)) {
      return res.json({ message: "Already saved", savedJobs: student.savedJobIds });
    }
    student.savedJobIds.push(job._id);
    await student.save();
    return res.json({ message: "Job saved", savedJobs: student.savedJobIds });
  } catch (error) {
    console.error("ADD SAVED JOB ERROR:", error);
    return res.status(500).json({ message: "Failed to save job" });
  }
};

export const removeSavedJob = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { jobId } = req.params;
    if (!userId || !jobId) return res.status(400).json({ message: "jobId required" });

    const student = await Student.findOne({ userId });
    if (!student) return res.status(404).json({ message: "Student profile not found" });

    student.savedJobIds = (student.savedJobIds || []).filter((id: any) => id.toString() !== jobId);
    await student.save();
    return res.json({ message: "Job removed from saved", savedJobs: student.savedJobIds });
  } catch (error) {
    console.error("REMOVE SAVED JOB ERROR:", error);
    return res.status(500).json({ message: "Failed to remove saved job" });
  }
};

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const students = await Student.find({}, 'name usn cgpa aptitudeScore codingScore interviewScore resumeScore');

    const leaderboard = students.map(student => {
      let score = 0;
      score += (student.aptitudeScore || 0) * 0.2;
      score += (student.codingScore || 0) * 0.4;
      score += (student.interviewScore || 0) * 0.3;
      score += (student.resumeScore || 0) * 0.1;

      return {
        _id: student._id,
        name: student.name,
        usn: student.usn,
        cgpa: student.cgpa,
        aptitudeScore: student.aptitudeScore,
        codingScore: student.codingScore,
        interviewScore: student.interviewScore,
        resumeScore: student.resumeScore,
        totalScore: Math.round(score * 10) // ELO
      };
    });

    leaderboard.sort((a, b) => b.totalScore - a.totalScore);

    return res.json({ leaderboard });
  } catch (error) {
    console.error("GET LEADERBOARD ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
};
