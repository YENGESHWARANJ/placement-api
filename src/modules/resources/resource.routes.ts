import { Router } from "express";
import {
    getResources,
    getFeaturedResources,
    getResourceById,
    createResource,
    updateResource,
    deleteResource,
    getCategories
} from "./resource.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

// Public routes
router.get("/", getResources);
router.get("/featured", getFeaturedResources);
router.get("/categories", getCategories);
router.get("/:id", getResourceById);

// Protected routes (Admin only - add admin middleware if needed)
router.post("/", authMiddleware, createResource);
router.put("/:id", authMiddleware, updateResource);
router.delete("/:id", authMiddleware, deleteResource);

export default router;
