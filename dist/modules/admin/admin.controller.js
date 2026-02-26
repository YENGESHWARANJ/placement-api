"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTests = exports.updateStudentStatus = exports.deleteStudent = exports.manageJobStatus = exports.getAllJobsAdmin = exports.updateRecruiterStatus = exports.getAllRecruiters = void 0;
const user_model_1 = __importStar(require("../users/user.model"));
const job_model_1 = __importDefault(require("../jobs/job.model"));
const student_model_1 = __importDefault(require("../students/student.model"));
const assessment_model_1 = __importDefault(require("../assessments/assessment.model"));
const application_model_1 = __importDefault(require("../applications/application.model"));
// --- RECRUITER MANAGEMENT ---
const getAllRecruiters = async (req, res) => {
    try {
        const recruiters = await user_model_1.default.find({ role: user_model_1.UserRole.RECRUITER })
            .select("-password")
            .sort({ createdAt: -1 });
        // Enrich with job counts
        const enrichedRecruiters = await Promise.all(recruiters.map(async (recruiter) => {
            const activeJobs = await job_model_1.default.countDocuments({ recruiterId: recruiter._id, status: 'Active' });
            return {
                ...recruiter.toObject(),
                activeJobs
            };
        }));
        return res.json({ recruiters: enrichedRecruiters });
    }
    catch (error) {
        console.error("GET RECRUITERS ERROR:", error);
        return res.status(500).json({ message: "Failed to fetch recruiters" });
    }
};
exports.getAllRecruiters = getAllRecruiters;
const updateRecruiterStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'active', 'rejected', 'suspended'
        if (!['active', 'rejected', 'suspended', 'pending'].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }
        const recruiter = await user_model_1.default.findByIdAndUpdate(id, { status }, { new: true }).select("-password");
        if (!recruiter)
            return res.status(404).json({ message: "Recruiter not found" });
        return res.json({ message: `Recruiter status updated to ${status}`, recruiter });
    }
    catch (error) {
        console.error("UPDATE RECRUITER STATUS ERROR:", error);
        return res.status(500).json({ message: "Failed to update status" });
    }
};
exports.updateRecruiterStatus = updateRecruiterStatus;
// --- JOB MANAGEMENT ---
const getAllJobsAdmin = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const search = req.query.search;
        const query = {};
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { company: { $regex: search, $options: "i" } }
            ];
        }
        const jobs = await job_model_1.default.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
        // Enrich with applicant counts
        const enrichedJobs = await Promise.all(jobs.map(async (job) => {
            const applicantsCount = await application_model_1.default.countDocuments({ jobId: job._id });
            return {
                ...job.toObject(),
                applicantsCount
            };
        }));
        const totalItems = await job_model_1.default.countDocuments(query);
        return res.json({
            jobs: enrichedJobs,
            totalPages: Math.ceil(totalItems / limit),
            currentPage: page,
            totalItems
        });
    }
    catch (error) {
        console.error("GET ALL JOBS ADMIN ERROR:", error);
        return res.status(500).json({ message: "Failed to fetch jobs" });
    }
};
exports.getAllJobsAdmin = getAllJobsAdmin;
const manageJobStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'active', 'closed', 'completed'
        const job = await job_model_1.default.findByIdAndUpdate(id, { status }, { new: true });
        if (!job)
            return res.status(404).json({ message: "Job not found" });
        return res.json({ message: "Job status updated", job });
    }
    catch (error) {
        console.error("MANAGE JOB ERROR:", error);
        return res.status(500).json({ message: "Failed to update job" });
    }
};
exports.manageJobStatus = manageJobStatus;
// --- STUDENT MANAGEMENT ---
const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await student_model_1.default.findById(id);
        if (!student)
            return res.status(404).json({ message: "Student not found" });
        // Delete user first, then student
        await user_model_1.default.findByIdAndDelete(student.userId);
        await student_model_1.default.findByIdAndDelete(id);
        return res.json({ message: "Student and user account deleted" });
    }
    catch (error) {
        console.error("DELETE STUDENT ERROR:", error);
        return res.status(500).json({ message: "Failed to delete student" });
    }
};
exports.deleteStudent = deleteStudent;
const updateStudentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        const student = await student_model_1.default.findByIdAndUpdate(id, { isActive }, { new: true });
        if (!student)
            return res.status(404).json({ message: "Student not found" });
        return res.json({ message: `Student account ${isActive ? 'enabled' : 'disabled'}`, student });
    }
    catch (error) {
        console.error("UPDATE STUDENT STATUS ERROR:", error);
        return res.status(500).json({ message: "Failed to update status" });
    }
};
exports.updateStudentStatus = updateStudentStatus;
// --- TEST MANAGEMENT ---
// (Assessments already have controllers, but admin might need to see all)
const getAllTests = async (req, res) => {
    try {
        const tests = await assessment_model_1.default.find().sort({ createdAt: -1 });
        return res.json({ tests });
    }
    catch (error) {
        console.error("GET ALL TESTS ERROR:", error);
        return res.status(500).json({ message: "Failed to fetch tests" });
    }
};
exports.getAllTests = getAllTests;
