"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const activity_controller_1 = require("./activity.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get("/my-activity", auth_middleware_1.authMiddleware, activity_controller_1.getMyActivity);
exports.default = router;
