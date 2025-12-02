"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
// src/models/user.ts
const BaseModels_1 = require("./BaseModels");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
class UserModel extends BaseModels_1.BaseModel {
    static initDB() {
        this.init();
    }
    // ========================
    // CREATE & FIND
    // ========================
    static create(data) {
        this.init();
        const id = `USR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const hash = bcryptjs_1.default.hashSync(data.password, 10);
        this.db.prepare(`
      INSERT INTO users (user_id, username, email, password_hash, role, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'active', datetime('now'), datetime('now'))
    `).run(id, data.username, data.email, hash, data.role);
        return this.findById(id);
    }
    static findByEmail(email) {
        this.init();
        return this.db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    }
    static findById(id) {
        this.init();
        return this.db.prepare("SELECT * FROM users WHERE user_id = ?").get(id);
    }
    static getProfile(userId) {
        const user = this.findById(userId);
        if (!user)
            return null;
        const { password_hash, ...profile } = user;
        return profile;
    }
    static validatePassword(user, password) {
        return bcryptjs_1.default.compareSync(password, user.password_hash);
    }
    // ========================
    // PASSWORD RESET FLOW
    // ========================
    /**
     * Generate a secure reset token and store it with expiry (15 minutes)
     */
    static generatePasswordResetToken(email) {
        this.init();
        const user = this.findByEmail(email);
        if (!user)
            return null;
        const token = crypto_1.default.randomBytes(32).toString("hex");
        const expiresAt = Date.now() + 60 * 60 * 1000;
        this.db.prepare(`
      UPDATE users 
      SET reset_token = ?, reset_token_expires_at = ?
      WHERE user_id = ?
    `).run(token, expiresAt, user.user_id);
        return { token, expiresAt };
    }
    static verifyResetToken(token) {
        this.init();
        const now = Date.now();
        const row = this.db.prepare(`
      SELECT * FROM users 
      WHERE reset_token = ? AND reset_token_expires_at > ?
    `).get(token, now);
        if (!row)
            return null;
        this.db.prepare(`
      UPDATE users SET reset_token = NULL, reset_token_expires_at = NULL
      WHERE user_id = ?
    `).run(row.user_id);
        return row;
    }
    static resetPassword(token, newPassword) {
        this.init();
        const user = this.verifyResetToken(token);
        if (!user)
            return false;
        const newHash = bcryptjs_1.default.hashSync(newPassword, 10);
        const result = this.db.prepare(`
      UPDATE users 
      SET password_hash = ?, updated_at = datetime('now'),
          reset_token = NULL, reset_token_expires_at = NULL
      WHERE user_id = ?
    `).run(newHash, user.user_id);
        return result.changes > 0;
    }
    static suspend(id) {
        this.init();
        const result = this.db.prepare(`
      UPDATE users SET status = 'suspended', updated_at = datetime('now')
      WHERE user_id = ?
    `).run(id);
        return result.changes > 0;
    }
    static activate(id) {
        this.init();
        const result = this.db.prepare(`
      UPDATE users SET status = 'active', updated_at = datetime('now')
      WHERE user_id = ?
    `).run(id);
        return result.changes > 0;
    }
    static updateProfile(userId, data) {
        this.init();
        // Fetch existing user
        const user = this.findById(userId);
        if (!user)
            return null;
        // If email is changing, make sure it's not already used by another user
        if (data.email && data.email !== user.email) {
            const existing = this.findByEmail(data.email);
            if (existing && existing.user_id !== userId) {
                throw new Error("Email already in use by another account");
            }
        }
        const newUsername = data.username ?? user.username;
        const newEmail = data.email ?? user.email;
        // Perform the update in the database
        this.db.prepare(`
    UPDATE users
    SET username = ?, email = ?, updated_at = datetime('now')
    WHERE user_id = ?
  `).run(newUsername, newEmail, userId);
        // Return updated profile
        return this.getProfile(userId);
    }
    static toPublicProfile(user) {
        const { user_id, username, email, role, status, created_at, updated_at } = user;
        return { user_id, username, email, role, status, created_at, updated_at };
    }
}
exports.UserModel = UserModel;
