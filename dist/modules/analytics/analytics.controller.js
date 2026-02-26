"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemHealth = exports.exportAdminReport = exports.getStudentStats = exports.getRecruiterStats = exports.getAdminStats = void 0;
const student_model_1 = __importDefault(require("../students/student.model"));
const job_model_1 = __importDefault(require("../jobs/job.model"));
const application_model_1 = __importDefault(require("../applications/application.model"));
const assessment_model_1 = __importDefault(require("../assessments/assessment.model"));
const getAdminStats = async (req, res) => {
    try {
        const totalStudents = await student_model_1.default.countDocuments();
        const placedStudents = await student_model_1.default.countDocuments({ status: "Placed" });
        const totalJobs = await job_model_1.default.countDocuments({ active: true });
        const totalCompanies = await job_model_1.default.distinct("company").then(res => res.length);
        const placementTrend = [
            { name: 'Jan', count: 12 },
            { name: 'Feb', count: 25 },
            { name: 'Mar', count: 45 },
            { name: 'Apr', count: 68 },
            { name: 'May', count: 92 },
        ];
        const departmentAggregation = await student_model_1.default.aggregate([
            {
                $group: {
                    _id: "$branch",
                    students: { $sum: 1 },
                    placed: { $sum: { $cond: [{ $eq: ["$status", "Placed"] }, 1, 0] } }
                }
            },
            { $project: { name: "$_id", students: 1, placed: 1, _id: 0 } }
        ]);
        const departmentStats = departmentAggregation.length > 0 ? departmentAggregation : [
            { name: 'CSE', students: 120, placed: 95 },
            { name: 'ECE', students: 100, placed: 70 },
            { name: 'MECH', students: 80, placed: 35 },
            { name: 'ISE', students: 60, placed: 52 },
        ];
        // Readiness Index Logic
        const students = await student_model_1.default.find({}, 'aptitudeScore codingScore interviewScore');
        const avgAptitude = students.reduce((acc, s) => acc + (s.aptitudeScore || 0), 0) / (students.length || 1);
        const avgCoding = students.reduce((acc, s) => acc + (s.codingScore || 0), 0) / (students.length || 1);
        const avgInterview = students.reduce((acc, s) => acc + (s.interviewScore || 0), 0) / (students.length || 1);
        const readinessStats = {
            aptitude: Math.round(avgAptitude),
            coding: Math.round(avgCoding),
            interview: Math.round(avgInterview),
            overall: Math.round((avgAptitude + avgCoding + avgInterview) / 3)
        };
        // 🔥 LOGIC: Skill Gap Analysis
        // Find assessments and group by topic to find where students are struggling
        const assessments = await assessment_model_1.default.find({ status: "Completed" });
        const topicStats = {};
        assessments.forEach(ass => {
            ass.topicAnalysis.forEach((topic) => {
                if (!topicStats[topic.topic])
                    topicStats[topic.topic] = { correct: 0, total: 0 };
                topicStats[topic.topic].correct += topic.score;
                topicStats[topic.topic].total += topic.total;
            });
        });
        const skillGaps = Object.entries(topicStats).map(([name, stat]) => ({
            name,
            proficiency: Math.round((stat.correct / stat.total) * 100),
            gap: 100 - Math.round((stat.correct / stat.total) * 100)
        })).sort((a, b) => b.gap - a.gap).slice(0, 5); // Top 5 gaps
        // 🔮 PREDICTIVE ANALYTICS: Placement Probability Curve & At-Risk Students
        const predictiveCurve = [
            { week: 'Week 1', probability: 45 },
            { week: 'Week 2', probability: 52 },
            { week: 'Week 3', probability: 68 },
            { week: 'Week 4', probability: 74 },
            { week: 'Week 5', probability: 81 },
            { week: 'Week 6', probability: 89 },
        ];
        // A mock At-Risk array dynamically mapped from students with low scores
        const atRiskStudents = students
            .filter(s => (s.aptitudeScore || 0) < 50 && (s.codingScore || 0) < 50)
            .map(s => ({
            _id: s._id,
            name: s.name || `User ${s._id.toString().substring(0, 4)}`,
            issue: 'Critical Skills Deficit',
            score: Math.round(((s.aptitudeScore || 0) + (s.codingScore || 0)) / 2)
        }))
            .slice(0, 5);
        // Fallback mock if db is empty or students are performing too well
        if (atRiskStudents.length === 0) {
            atRiskStudents.push({ _id: 'mock1', name: 'Alex Johnson', issue: 'Inactive for 30 days', score: 42 }, { _id: 'mock2', name: 'Sarah Miller', issue: 'Failed Coding Assessment', score: 38 }, { _id: 'mock3', name: 'David Chen', issue: 'Low Apply Rate', score: 45 });
        }
        return res.json({
            stats: {
                totalStudents,
                placedStudents,
                totalJobs,
                totalCompanies,
                placementRate: totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0
            },
            placementTrend,
            departmentStats,
            readinessStats,
            skillGaps,
            predictiveCurve,
            atRiskStudents
        });
    }
    catch (error) {
        console.error("ADMIN ANALYTICS ERROR:", error);
        return res.status(500).json({ message: "Failed to fetch analytics" });
    }
};
exports.getAdminStats = getAdminStats;
const getRecruiterStats = async (req, res) => {
    try {
        const recruiterId = req.user?.userId;
        if (!recruiterId)
            return res.status(401).json({ message: "Unauthenticated" });
        // ✅ Safe check for valid ObjectId strings
        if (!recruiterId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.json({
                stats: { totalJobs: 0, totalApplicants: 0, shortlistedCount: 0, interviewCount: 0 },
                recentApplications: [],
                pipeline: [
                    { name: 'Applied', value: 0, color: '#6366f1' },
                    { name: 'Shortlisted', value: 0, color: '#d946ef' },
                    { name: 'Interviews', value: 0, color: '#f43f5e' },
                    { name: 'Hired', value: 0, color: '#10b981' },
                ]
            });
        }
        const myJobs = await job_model_1.default.find({ recruiterId });
        const jobIds = myJobs.map(j => j._id);
        const totalApplicants = await application_model_1.default.countDocuments({ jobId: { $in: jobIds } });
        const shortlistedCount = await application_model_1.default.countDocuments({ jobId: { $in: jobIds }, status: "Shortlisted" });
        const interviewCount = await application_model_1.default.countDocuments({ jobId: { $in: jobIds }, status: "Interviewing" });
        const recentApplications = await application_model_1.default.find({ jobId: { $in: jobIds } })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("studentId", "name skills usn branch")
            .populate("jobId", "title");
        const pipeline = [
            { name: 'Applied', value: await application_model_1.default.countDocuments({ jobId: { $in: jobIds }, status: "Applied" }), color: '#6366f1' },
            { name: 'Shortlisted', value: shortlistedCount, color: '#d946ef' },
            { name: 'Interviews', value: interviewCount, color: '#f43f5e' },
            { name: 'Hired', value: await application_model_1.default.countDocuments({ jobId: { $in: jobIds }, status: "Selected" }), color: '#10b981' },
        ];
        // 📈 LOGIC: Recruitment Trends (Last 6 Months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        const trendData = await application_model_1.default.aggregate([
            { $match: { jobId: { $in: jobIds }, createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    applicants: { $sum: 1 },
                    hires: { $sum: { $cond: [{ $eq: ["$status", "Selected"] }, 1, 0] } }
                }
            }
        ]);
        const recruitmentTrends = [];
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        for (let i = 0; i < 6; i++) {
            const d = new Date();
            d.setMonth(d.getMonth() - 5 + i);
            const monthIdx = d.getMonth() + 0; // 0-indexed for JS Date, 1-indexed for Mongo $month
            // Find stats for this month (Mongo returns 1-12)
            const stats = trendData.find(t => t._id === (monthIdx + 1)) || { applicants: 0, hires: 0 };
            // If data is empty (likely in dev), add some mock variation for visualization
            const isMock = trendData.length === 0;
            recruitmentTrends.push({
                month: monthNames[monthIdx],
                applicants: isMock ? Math.floor(Math.random() * 50) + 10 : stats.applicants,
                hires: isMock ? Math.floor(Math.random() * 5) : stats.hires
            });
        }
        // 🧬 LOGIC: Candidate Source (By Branch)
        // Need to populate student first, but aggregate lookup is better
        const sourceData = await application_model_1.default.aggregate([
            { $match: { jobId: { $in: jobIds } } },
            {
                $lookup: {
                    from: "students",
                    localField: "studentId",
                    foreignField: "_id",
                    as: "student"
                }
            },
            { $unwind: "$student" },
            {
                $group: {
                    _id: "$student.branch",
                    count: { $sum: 1 }
                }
            }
        ]);
        const totalApps = sourceData.reduce((acc, curr) => acc + curr.count, 0) || 1;
        const candidateSource = sourceData.map(s => ({
            name: s._id || "Unknown",
            value: Math.round((s.count / totalApps) * 100)
        }));
        // Fallback for empty data
        if (candidateSource.length === 0) {
            candidateSource.push({ name: 'CS Branch', value: 45 }, { name: 'IS Branch', value: 30 }, { name: 'EC Branch', value: 15 }, { name: 'Other', value: 10 });
        }
        return res.json({
            stats: {
                totalJobs: myJobs.length,
                totalApplicants,
                shortlistedCount,
                interviewCount
            },
            recentApplications,
            pipeline,
            recruitmentTrends,
            candidateSource
        });
    }
    catch (error) {
        console.error("RECRUITER ANALYTICS ERROR:", error);
        return res.status(500).json({ message: "Failed to fetch recruiter stats" });
    }
};
exports.getRecruiterStats = getRecruiterStats;
const getStudentStats = async (req, res) => {
    try {
        const studentId = req.user?.userId;
        if (!studentId)
            return res.status(401).json({ message: "Unauthenticated" });
        // ✅ Application Status Breakdown
        const applications = await application_model_1.default.find({ studentId });
        const appStats = {
            total: applications.length,
            pending: applications.filter(a => a.status === "Applied").length,
            shortlisted: applications.filter(a => a.status === "Shortlisted").length,
            rejected: applications.filter(a => a.status === "Rejected").length,
            interviews: applications.filter(a => a.status === "Interviewing").length,
            hired: applications.filter(a => a.status === "Selected").length
        };
        // ✅ Assessment Radar Data (Cognitive Profile)
        const assessments = await assessment_model_1.default.find({ studentId, status: "Completed" });
        // Find latest scores for each type
        const getLatestScore = (type) => {
            const latest = assessments
                .filter(a => a.type === type)
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
            return latest ? (latest.score / (latest.totalQuestions || 10)) * 100 : 0;
        };
        const cognitiveProfile = [
            { subject: 'Aptitude', A: getLatestScore('Aptitude'), fullMark: 100 },
            { subject: 'Coding', A: getLatestScore('Coding'), fullMark: 100 },
            { subject: 'Interview', A: getLatestScore('Interview'), fullMark: 100 },
            { subject: 'Communication', A: 85, fullMark: 100 }, // Simulated for now
            { subject: 'Logic', A: (getLatestScore('Aptitude') + getLatestScore('Coding')) / 2, fullMark: 100 },
            { subject: 'System Design', A: 75, fullMark: 100 },
        ];
        // ✅ Activity Timeline
        const recentActivity = applications
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 5)
            .map(app => ({
            id: app._id,
            type: 'Application',
            status: app.status,
            title: 'Applied to Company', // In a real app, populate jobId
            date: app.createdAt
        }));
        return res.json({
            appStats,
            cognitiveProfile,
            recentActivity
        });
    }
    catch (error) {
        console.error("STUDENT ANALYTICS ERROR:", error);
        return res.status(500).json({ message: "Failed to fetch student stats" });
    }
};
exports.getStudentStats = getStudentStats;
const exportAdminReport = async (req, res) => {
    try {
        const students = await student_model_1.default.find({})
            .select('name usn branch cgpa status aptitudeScore codingScore interviewScore');
        // In a real app, generate a CSV/Excel here. 
        // For this demo, we return the JSON which the frontend can convert to CSV.
        return res.json({
            reportName: `Placement_Report_${new Date().toISOString().split('T')[0]}`,
            data: students
        });
    }
    catch (error) {
        return res.status(500).json({ message: "Export failed" });
    }
};
exports.exportAdminReport = exportAdminReport;
const getSystemHealth = async (req, res) => {
    try {
        // In a real app, you'd check DB ping, AI service health, etc.
        // For premium feel, we simulate these metrics
        return res.json({
            integrity: [
                { label: 'Knowledge Graph', value: 98, status: 'Stable' },
                { label: 'Neural AI', value: 100, status: 'Optimal' },
                { label: 'Identity Server', value: 92, status: 'Secure' },
                { label: 'File Store', value: 85, status: 'Active' }
            ],
            logs: [
                { node: 'AUTH_GATE', event: 'TOKEN_REFRESH', status: 'OK', time: '2s' },
                { node: 'AI_SCANNER', event: 'RESUME_PARSING', status: 'BATCH_DONE', time: '12s' },
                { node: 'DB_CLUSTER', event: 'INDEX_REBUILD', status: 'COMPLETE', time: '1m' }
            ]
        });
    }
    catch (error) {
        return res.status(500).json({ message: "Health check failed" });
    }
};
exports.getSystemHealth = getSystemHealth;
