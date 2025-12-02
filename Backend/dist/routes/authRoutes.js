"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/authRoutes.ts
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
// Existing routes
router.post("/register", authController_1.AuthController.register);
router.post("/login", authController_1.AuthController.login);
// New routes for password reset
router.post("/forgot-password", authController_1.AuthController.forgotPassword);
router.post("/reset-password", authController_1.AuthController.resetPassword);
exports.default = router;
