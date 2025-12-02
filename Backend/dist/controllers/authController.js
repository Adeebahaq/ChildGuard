"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const DatabaseConnection_1 = require("../config/database/DatabaseConnection");
const mail_1 = require("../utils/mail"); // import your mail utility
const JWT_SECRET = "your_jwt_secret";
// Temporary in-memory store for reset tokens
const resetTokens = {}; // token -> user_id
class AuthController {
    static register(req, res) {
        try {
            const db = DatabaseConnection_1.DatabaseConnection.getInstance();
            const { username, email, password, role, phone, address, area } = req.body;
            const allowedRoles = ["parent", "sponsor", "volunteer", "admin", "case_reporter"];
            if (!allowedRoles.includes(role)) {
                return res.status(400).json({ error: "Invalid user role" });
            }
            const existing = db.prepare("SELECT * FROM users WHERE email = ? OR username = ?")
                .get(email, username);
            if (existing)
                return res.status(400).json({ error: "User already exists" });
            const hash = bcryptjs_1.default.hashSync(password, 10);
            const user_id = `USR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const newUser = db.transaction(() => {
                db.prepare(`
                    INSERT INTO users (user_id, username, email, password_hash, role)
                    VALUES (?, ?, ?, ?, ?)
                `).run(user_id, username, email, hash, role);
                switch (role) {
                    case "parent":
                        db.prepare(`
                            INSERT INTO parents (parent_id, phone, address)
                            VALUES (?, ?, ?)
                        `).run(user_id, phone ?? null, address ?? null);
                        break;
                    case "sponsor":
                        const prefsJson = req.body.preferences ? JSON.stringify(req.body.preferences) : null;
                        db.prepare(`
                            INSERT INTO sponsors (sponsor_id, phone, preferences)
                            VALUES (?, ?, ?)
                        `).run(user_id, phone ?? null, prefsJson);
                        break;
                    case "volunteer":
                        db.prepare(`
                            INSERT INTO volunteers (volunteer_id, phone, area, status)
                            VALUES (?, ?, ?, ?)
                        `).run(user_id, phone ?? null, area ?? null, "pending");
                        break;
                    default:
                        break;
                }
                return db.prepare(`
                    SELECT user_id, username, email, role FROM users WHERE user_id = ?
                `).get(user_id);
            })();
            const token = jsonwebtoken_1.default.sign({ user_id: newUser.user_id, role: newUser.role }, JWT_SECRET, { expiresIn: "1h" });
            res.status(201).json({
                message: "Registration successful",
                user: newUser,
                token,
            });
        }
        catch (err) {
            console.error("Registration error:", err);
            res.status(500).json({
                error: "Registration failed",
                details: err instanceof Error ? err.message : String(err)
            });
        }
    }
    static login(req, res) {
        try {
            const db = DatabaseConnection_1.DatabaseConnection.getInstance();
            const { email, password } = req.body;
            const user = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email);
            if (!user)
                return res.status(400).json({ error: "User not found" });
            const valid = bcryptjs_1.default.compareSync(password, user.password_hash);
            if (!valid)
                return res.status(400).json({ error: "Invalid password" });
            const token = jsonwebtoken_1.default.sign({ user_id: user.user_id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
            res.json({
                message: "Login successful",
                token,
                user: {
                    user_id: user.user_id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                },
            });
        }
        catch (err) {
            console.error("Login error:", err);
            res.status(500).json({
                error: "Login failed",
                details: err instanceof Error ? err.message : String(err)
            });
        }
    }
    // ------------------- Forgot & Reset Password -------------------
    static async forgotPassword(req, res) {
        try {
            const db = DatabaseConnection_1.DatabaseConnection.getInstance();
            const { email } = req.body;
            if (!email)
                return res.status(400).json({ error: "Email is required" });
            const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
            if (!user)
                return res.status(404).json({ error: "User not found" });
            // Generate a secure token
            const token = Math.random().toString(36).substring(2, 15);
            resetTokens[token] = user.user_id;
            // Send the token via email
            await (0, mail_1.sendResetEmail)(email, token);
            res.json({ message: "Reset link sent to your email." });
        }
        catch (err) {
            console.error("Forgot Password Error:", err);
            res.status(500).json({ error: "Failed to send reset email" });
        }
    }
    static resetPassword(req, res) {
        try {
            const db = DatabaseConnection_1.DatabaseConnection.getInstance();
            const { token, newPassword } = req.body;
            if (!token || !newPassword)
                return res.status(400).json({ error: "Token and new password required" });
            const userId = resetTokens[token];
            if (!userId)
                return res.status(400).json({ error: "Invalid or expired token" });
            const hash = bcryptjs_1.default.hashSync(newPassword, 10);
            db.prepare("UPDATE users SET password_hash = ? WHERE user_id = ?").run(hash, userId);
            delete resetTokens[token]; // Remove used token
            res.json({ message: "Password reset successful" });
        }
        catch (err) {
            console.error("Reset Password Error:", err);
            res.status(500).json({ error: "Failed to reset password" });
        }
    }
}
exports.AuthController = AuthController;
