import winston from "winston";
import path from "path";

// Define custom log format
const logFormat = winston.format.printf(({ level, message, timestamp, stack, ...metadata }) => {
    let msg = `${timestamp} [${level}] : ${stack || message}`;
    const metaKeys = Object.keys(metadata);
    if (metaKeys.length > 0 && metaKeys[0] !== 'service') {
        msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
});

// Create the logger instance
const logger = winston.createLogger({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: { service: "placement-api" },
    transports: [
        // Write all logs with level `error` and below to `error.log`
        new winston.transports.File({ filename: path.join(__dirname, "../../logs/error.log"), level: "error" }),
        // Write all logs with level `info` and below to `combined.log`
        new winston.transports.File({ filename: path.join(__dirname, "../../logs/combined.log") }),
    ],
});

// If we're not in production, log to the `console` with colored, simple format
if (process.env.NODE_ENV !== "production") {
    logger.add(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                logFormat
            ),
        })
    );
}

// ── Morgan Stream for HTTP Logging ──
export const stream = {
    write: (message: string) => {
        logger.info(message.trim());
    },
};

export default logger;
