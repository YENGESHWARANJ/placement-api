"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const alumni_controller_1 = require("./alumni.controller");
const router = (0, express_1.Router)();
router.get("/directory", auth_middleware_1.authMiddleware, alumni_controller_1.getAlumniDirectory);
router.post("/request-mentorship", auth_middleware_1.authMiddleware, alumni_controller_1.requestMentorship);
exports.default = router;
