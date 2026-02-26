import { Router } from "express";
import { createDrive, getAllDrives, deleteDrive, updateDrive } from "./drive.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { rbacMiddleware } from "../../middleware/rbac.middleware";
import { UserRole } from "../auth/auth.types";

const router = Router();

router.post("/", authMiddleware, rbacMiddleware([UserRole.ADMIN, UserRole.OFFICER]), createDrive);
router.get("/", authMiddleware, getAllDrives);
router.put("/:id", authMiddleware, rbacMiddleware([UserRole.ADMIN, UserRole.OFFICER]), updateDrive);
router.delete("/:id", authMiddleware, rbacMiddleware([UserRole.ADMIN, UserRole.OFFICER]), deleteDrive);

export default router;
