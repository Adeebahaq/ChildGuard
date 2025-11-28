// src/routes/authRoutes.ts
import { Router } from "express";
import { AuthController } from "../controllers/authController";

const router = Router();

// Existing routes
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

// New routes for password reset
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/reset-password", AuthController.resetPassword);

export default router;
