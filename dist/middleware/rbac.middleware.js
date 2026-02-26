"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rbacMiddleware = void 0;
const rbacMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized: No user found" });
        }
        if (!allowedRoles.includes(req.user.role)) {
            console.warn(`[RBAC] Access denied for user ${req.user.userId} with role ${req.user.role}. Allowed: ${allowedRoles.join(",")}`);
            return res.status(403).json({
                message: "Forbidden: You do not have permission to access this resource",
            });
        }
        next();
    };
};
exports.rbacMiddleware = rbacMiddleware;
