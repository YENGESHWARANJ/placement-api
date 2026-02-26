import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
    [key: string]: any;
  };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  // ⚠️ DEV ONLY mock bypass — remove or guard in production
  if (process.env.NODE_ENV !== "production" && token.startsWith("mock-")) {
    let role = "student";
    if (token.includes("recruiter")) role = "recruiter";
    if (token.includes("admin")) role = "admin";
    if (token.includes("officer")) role = "officer";

    req.user = {
      userId: "65cf0e1d5a2d6a001b8e8b01",
      role,
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      ...decoded,
    };
    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired. Please log in again." });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Role-based access control middleware
export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
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
