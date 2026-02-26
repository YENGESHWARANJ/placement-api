"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withdrawApplication = exports.updateApplicationStatus = exports.fastTrackApplicant = exports.getJobApplicants = exports.getMyApplications = exports.applyForJob = void 0;
const application_model_1 = __importDefault(require("./application.model"));
const job_model_1 = __importDefault(require("../jobs/job.model"));
const student_model_1 = __importDefault(require("../students/student.model"));
const user_model_1 = __importDefault(require("../users/user.model"));
const socket_config_1 = require("../../config/socket.config");
const notice_model_1 = __importDefault(require("../notices/notice.model"));
// ================================
// APPLY FOR JOB (Student)
// ================================
const applyForJob = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { jobId } = req.body;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // Verify student
        const student = await student_model_1.default.findOne({ userId });
        if (!student) {
            return res.status(403).json({ message: "Only students can apply" });
        }
        // Verify job
        const job = await job_model_1.default.findOne({ _id: jobId, active: true });
        if (!job) {
            return res.status(404).json({ message: "Job not found or inactive" });
        }
        // Check if deadline passed
        if (job.deadline && new Date() > new Date(job.deadline)) {
            return res.status(400).json({ message: "Application deadline has passed" });
        }
        // Create application
        const application = await application_model_1.default.create({
            jobId,
            studentId: student._id,
            status: "Applied",
            resumeUrl: student.resumeUrl
        });
        // NOTIFY RECRUITER
        (0, socket_config_1.sendNotification)(job.recruiterId.toString(), {
            message: `New applicant for ${job.title}: ${student.name}`,
            type: "success"
        });
        // GLOBAL NOTIFICATION
        (0, socket_config_1.broadcastGlobalEvent)("global_notification", {
            message: `🚀 Someone just applied for: ${job.title} at ${job.company}`,
            type: "info"
        });
        await notice_model_1.default.create({
            title: "New Job Applicant",
            content: `${student.name} applied for your job: ${job.title}`,
            type: "Recruiter",
            priority: "Medium",
            targetUser: job.recruiterId,
            createdBy: userId
        });
        return res.status(201).json({
            message: "Application submitted successfully",
            application
        });
    }
    catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "You have already applied for this job" });
        }
        console.error("APPLY JOB ERROR:", error);
        return res.status(500).json({ message: "Failed to apply for job" });
    }
};
exports.applyForJob = applyForJob;
// ================================
// GET MY APPLICATIONS (Student)
// ================================
const getMyApplications = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        let student = await student_model_1.default.findOne({ userId });
        const user = await user_model_1.default.findById(userId);
        if (!student && (user || req.user?.role === 'student')) {
            student = await student_model_1.default.create({
                userId: userId,
                name: user?.name || "Mock Student",
                usn: `MOCK_${userId.slice(-6).toUpperCase()}`,
                branch: "Engineering",
                year: 3,
                status: "Unplaced"
            });
            console.log(`[APP] Self-healed student profile for ID: ${userId}`);
        }
        if (!student) {
            return res.status(404).json({ message: "Student profile not found" });
        }
        const applications = await application_model_1.default.find({ studentId: student._id })
            .populate("jobId", "title company location type salary")
            .sort({ createdAt: -1 });
        return res.json({ applications });
    }
    catch (error) {
        console.error("GET MY APPLICATIONS ERROR:", error);
        return res.status(500).json({ message: "Failed to fetch applications" });
    }
};
exports.getMyApplications = getMyApplications;
// ================================
// GET JOB APPLICANTS (Recruiter)
// ================================
const getJobApplicants = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { jobId } = req.params;
        // Verify job ownership
        const job = await job_model_1.default.findById(jobId);
        if (!job)
            return res.status(404).json({ message: "Job not found" });
        if (job.recruiterId.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized access to these applicants" });
        }
        const applications = await application_model_1.default.find({ jobId })
            .populate("studentId", "name usn branch cgpa skills email aptitudeScore codingScore interviewScore resumeScore about")
            .sort({ createdAt: -1 });
        // 🔥 LOGIC: Dynamic AI Matching
        const rankedApplications = applications.map(app => {
            const student = app.studentId;
            if (!student)
                return app;
            // Simplified ranking algorithm
            // 1. Technical Readiness (40%)
            const technicalScore = ((student.aptitudeScore || 0) + (student.codingScore || 0) + (student.interviewScore || 0)) / 3;
            // 2. Skill Match (40%)
            const matchingSkills = student.skills.filter((s) => job.requirements.some((r) => r.toLowerCase().includes(s.toLowerCase())));
            const skillScore = job.requirements.length > 0 ? (matchingSkills.length / job.requirements.length) * 100 : 50;
            // 3. Academic Benchmarking (20%)
            const academicScore = (student.cgpa / 10) * 100;
            const finalMatchScore = Math.round((technicalScore * 0.4) + (skillScore * 0.4) + (academicScore * 0.2));
            // Generate AI Insight
            let insight = "";
            if (finalMatchScore > 85)
                insight = "Elite Talent: Exceptional logic and skill alignment detected.";
            else if (finalMatchScore > 70)
                insight = "Strong Fit: Solid technical base with good profile convergence.";
            else
                insight = "Potential Match: Foundational skills present; needs interview verification.";
            return {
                ...app.toObject(),
                matchScore: finalMatchScore,
                aiInsights: insight
            };
        });
        // Sort by match score DESC
        rankedApplications.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        return res.json({ applications: rankedApplications });
    }
    catch (error) {
        console.error("GET APPLICANTS ERROR:", error);
        return res.status(500).json({ message: "Failed to fetch applicants" });
    }
};
exports.getJobApplicants = getJobApplicants;
// ================================
// FAST TRACK APPLICANT (Recruiter)
// ================================
const fastTrackApplicant = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;
        const application = await application_model_1.default.findById(id).populate("jobId").populate("studentId");
        if (!application)
            return res.status(404).json({ message: "Application not found" });
        // @ts-ignore
        if (application.jobId.recruiterId.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        application.status = "Shortlisted";
        await application.save();
        // Send high-priority notification
        // @ts-ignore
        const studentUserId = application.studentId.userId.toString();
        // @ts-ignore
        const jobTitle = application.jobId.title;
        (0, socket_config_1.sendNotification)(studentUserId, {
            message: `🔥 FAST-TRACKED! You have been shortlisted for ${jobTitle}. Prepare for the final rounds!`,
            type: "success"
        });
        await notice_model_1.default.create({
            title: "Application Fast-Tracked!",
            content: `You have been shortlisted for ${jobTitle}. Prepare for the final rounds!`,
            type: "Student",
            priority: "High",
            createdBy: userId,
            targetUser: studentUserId
        });
        return res.json({ message: "Applicant fast-tracked", application });
    }
    catch (error) {
        console.error("FAST TRACK ERROR:", error);
        return res.status(500).json({ message: "Failed to fast-track" });
    }
};
exports.fastTrackApplicant = fastTrackApplicant;
// ================================
// UPDATE STATUS (Recruiter)
// ================================
const updateApplicationStatus = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;
        const { status } = req.body;
        const application = await application_model_1.default.findById(id).populate("jobId").populate("studentId");
        if (!application)
            return res.status(404).json({ message: "Application not found" });
        // Verify ownership via Job
        // @ts-ignore
        if (application.jobId.recruiterId.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        application.status = status;
        await application.save();
        // NOTIFY STUDENT
        // @ts-ignore
        const studentUserId = application.studentId.userId.toString();
        // @ts-ignore
        const jobTitle = application.jobId.title;
        (0, socket_config_1.sendNotification)(studentUserId, {
            message: `Application Status Updated: ${jobTitle} -> ${status}`,
            type: status === "Selected" || status === "Shortlisted" ? "success" : "info"
        });
        await notice_model_1.default.create({
            title: "Application Status Update",
            content: `Your application status for ${jobTitle} has been updated to: ${status}`,
            type: "Student",
            priority: status === "Selected" || status === "Shortlisted" ? "High" : "Medium",
            createdBy: userId,
            targetUser: studentUserId
        });
        return res.json({ message: "Status updated", application });
    }
    catch (error) {
        console.error("UPDATE STATUS ERROR:", error);
        return res.status(500).json({ message: "Failed to update status" });
    }
};
exports.updateApplicationStatus = updateApplicationStatus;
// ================================
// WITHDRAW APPLICATION (Student)
// ================================
const withdrawApplication = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        const student = await student_model_1.default.findOne({ userId });
        if (!student)
            return res.status(403).json({ message: "Student profile not found" });
        const application = await application_model_1.default.findById(id).populate("studentId");
        if (!application)
            return res.status(404).json({ message: "Application not found" });
        // @ts-ignore - studentId can be ObjectId or populated
        const appStudentId = application.studentId?._id?.toString() ?? application.studentId?.toString();
        if (appStudentId !== student._id.toString()) {
            return res.status(403).json({ message: "You can only withdraw your own application" });
        }
        application.status = "Withdrawn";
        await application.save();
        return res.json({ message: "Application withdrawn", application });
    }
    catch (error) {
        console.error("WITHDRAW APPLICATION ERROR:", error);
        return res.status(500).json({ message: "Failed to withdraw application" });
    }
};
exports.withdrawApplication = withdrawApplication;
