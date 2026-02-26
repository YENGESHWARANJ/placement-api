"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const resource_controller_1 = require("./resource.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Public routes
router.get("/", resource_controller_1.getResources);
router.get("/featured", resource_controller_1.getFeaturedResources);
router.get("/categories", resource_controller_1.getCategories);
router.get("/:id", resource_controller_1.getResourceById);
// Protected routes (Admin only - add admin middleware if needed)
router.post("/", auth_middleware_1.authMiddleware, resource_controller_1.createResource);
router.put("/:id", auth_middleware_1.authMiddleware, resource_controller_1.updateResource);
router.delete("/:id", auth_middleware_1.authMiddleware, resource_controller_1.deleteResource);
exports.default = router;
