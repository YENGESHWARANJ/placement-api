"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENV = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.ENV = {
    PORT: process.env.PORT || "5000",
    NODE_ENV: process.env.NODE_ENV || "development",
    MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/placement",
    JWT_SECRET: process.env.JWT_SECRET || "dev-secret-key-change-in-production",
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "dev-refresh-secret-key",
    AI_GATEWAY_URL: process.env.AI_GATEWAY_URL || "http://localhost:8000",
    REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
};
if (process.env.NODE_ENV === "production") {
    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
        throw new Error("❌ Missing required environment variables in production");
    }
}
