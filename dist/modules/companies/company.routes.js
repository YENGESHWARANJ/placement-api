"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const company_controller_1 = require("./company.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const user_model_1 = require("../users/user.model");
const router = (0, express_1.Router)();
// Protect all routes - only admin and officer
router.use(auth_middleware_1.authMiddleware, (0, rbac_middleware_1.rbacMiddleware)([user_model_1.UserRole.ADMIN, user_model_1.UserRole.OFFICER]));
router.get("/", company_controller_1.getCompanies);
router.post("/", company_controller_1.createCompany);
router.put("/:id", company_controller_1.updateCompany);
router.delete("/:id", company_controller_1.deleteCompany);
exports.default = router;
