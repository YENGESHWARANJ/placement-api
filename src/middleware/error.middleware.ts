import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const statusCode = err.status || 500;
    const message = err.message || "Something went wrong";

    // Log full error on server
    logger.error(`[CRITICAL ERROR] Path: ${req.originalUrl} | Message: ${message}`, { stack: err.stack });

    // Send generic error to user in production, detailed only in development
    res.status(statusCode).json({
        message: process.env.NODE_ENV === "production" ? "Something went wrong" : message,
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
        path: req.originalUrl
    });
};
