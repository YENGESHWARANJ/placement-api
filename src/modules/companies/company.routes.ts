import { Router } from "express";
import { getCompanies, createCompany, updateCompany, deleteCompany } from "./company.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { rbacMiddleware } from "../../middleware/rbac.middleware";
import { UserRole } from "../users/user.model";

const router = Router();

// Protect all routes - only admin and officer
router.use(authMiddleware, rbacMiddleware([UserRole.ADMIN, UserRole.OFFICER]));

router.get("/", getCompanies);
router.post("/", createCompany);
router.put("/:id", updateCompany);
router.delete("/:id", deleteCompany);

export default router;
