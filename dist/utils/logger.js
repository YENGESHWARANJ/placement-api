"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stream = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
// Define custom log format
const logFormat = winston_1.default.format.printf(({ level, message, timestamp, stack, ...metadata }) => {
    let msg = `${timestamp} [${level}] : ${stack || message}`;
    const metaKeys = Object.keys(metadata);
    if (metaKeys.length > 0 && metaKeys[0] !== 'service') {
        msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
});
// Create the logger instance
const logger = winston_1.default.createLogger({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    format: winston_1.default.format.combine(winston_1.default.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.splat(), winston_1.default.format.json()),
    defaultMeta: { service: "placement-api" },
    transports: [
        // Write all logs with level `error` and below to `error.log`
        new winston_1.default.transports.File({ filename: path_1.default.join(__dirname, "../../logs/error.log"), level: "error" }),
        // Write all logs with level `info` and below to `combined.log`
        new winston_1.default.transports.File({ filename: path_1.default.join(__dirname, "../../logs/combined.log") }),
    ],
});
// If we're not in production, log to the `console` with colored, simple format
if (process.env.NODE_ENV !== "production") {
    logger.add(new winston_1.default.transports.Console({
        format: winston_1.default.format.combine(winston_1.default.format.colorize(), logFormat),
    }));
}
// ── Morgan Stream for HTTP Logging ──
exports.stream = {
    write: (message) => {
        logger.info(message.trim());
    },
};
exports.default = logger;
