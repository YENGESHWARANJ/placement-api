"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const hpp_1 = __importDefault(require("hpp"));
const mongoose_1 = __importDefault(require("mongoose"));
const morgan_1 = __importDefault(require("morgan"));
const logger_1 = require("./utils/logger");
const routes_1 = __importDefault(require("./routes"));
const analytics_routes_1 = __importDefault(require("./modules/analytics/analytics.routes"));
const notice_routes_1 = __importDefault(require("./modules/notices/notice.routes"));
const activity_routes_1 = __importDefault(require("./modules/activity/activity.routes"));
const alumni_routes_1 = __importDefault(require("./modules/alumni/alumni.routes"));
const rateLimit_middleware_1 = require("./middleware/rateLimit.middleware");
const error_middleware_1 = require("./middleware/error.middleware");
const app = (0, express_1.default)();
// ✅ Security Headers
app.use((0, helmet_1.default)());
// ✅ HTTP Logging
app.use((0, morgan_1.default)("combined", { stream: logger_1.stream }));
// ✅ Prevent XSS attacks
const xss = require("xss-clean");
app.use(xss());
// ✅ Prevent HTTP Parameter Pollution
app.use((0, hpp_1.default)());
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim()) : []),
];
const isDev = process.env.NODE_ENV !== "production";
// ✅ Proper CORS config for frontend
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow no-origin (e.g. Postman), dev, or whitelist (including CORS_ORIGIN)
        if (!origin || isDev || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            console.error(`[CORS REJECTED] Origin: ${origin}`);
            callback(new Error(`Not allowed by CORS: ${origin}`));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ limit: '10mb', extended: true }));
app.use((0, cookie_parser_1.default)());
// ✅ Rate Limiting
app.use("/api", rateLimit_middleware_1.apiRateLimiter);
// API routes
app.use("/api/analytics", analytics_routes_1.default);
app.use("/api/notices", notice_routes_1.default);
app.use("/api/activity", activity_routes_1.default);
app.use("/api/alumni", alumni_routes_1.default);
// ✅ Favicon fix
app.get("/favicon.ico", (req, res) => res.status(204).end());
// ✅ Root test route
// ✅ Health Check
app.get("/health", (req, res) => {
    res.json({
        status: "active",
        database: mongoose_1.default.connection.readyState === 1 ? "connected" : "disconnected",
        timestamp: new Date()
    });
});
app.get("/", (req, res) => {
    res.send("Backend running 🚀 Security Shield Active 🛡️");
});
// API routes
app.use("/api", routes_1.default);
// Error Handling
app.use(error_middleware_1.errorHandler);
exports.default = app;
