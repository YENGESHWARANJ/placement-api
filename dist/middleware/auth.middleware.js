"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    // ⚠️ DEV ONLY mock bypass — remove or guard in production
    if (process.env.NODE_ENV !== "production" && token.startsWith("mock-")) {
        let role = "student";
        if (token.includes("recruiter"))
            role = "recruiter";
        if (token.includes("admin"))
            role = "admin";
        if (token.includes("officer"))
            role = "officer";
        req.user = {
            userId: "65cf0e1d5a2d6a001b8e8b01",
            role,
        };
        return next();
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = {
            userId: decoded.userId,
            role: decoded.role,
            ...decoded,
        };
        next();
    }
    catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired. Please log in again." });
        }
        return res.status(401).json({ message: "Invalid token" });
    }
};
exports.authMiddleware = authMiddleware;
// Role-based access control middleware
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Forbidden: requires one of [${roles.join(", ")}] role`,
            });
        }
        next();
    };
};
exports.requireRole = requireRole;
