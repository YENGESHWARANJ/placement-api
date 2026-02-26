"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const errorHandler = (err, req, res, next) => {
    const statusCode = err.status || 500;
    const message = err.message || "Something went wrong";
    // Log full error on server
    logger_1.default.error(`[CRITICAL ERROR] Path: ${req.originalUrl} | Message: ${message}`, { stack: err.stack });
    // Send generic error to user in production, detailed only in development
    res.status(statusCode).json({
        message: process.env.NODE_ENV === "production" ? "Something went wrong" : message,
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
        path: req.originalUrl
    });
};
exports.errorHandler = errorHandler;
