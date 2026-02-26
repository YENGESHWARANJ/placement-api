"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const roadmap_controller_1 = require("./roadmap.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get("/", auth_middleware_1.authMiddleware, roadmap_controller_1.getRoadmap);
router.post("/align", auth_middleware_1.authMiddleware, roadmap_controller_1.updateObjective);
exports.default = router;
