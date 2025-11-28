// src/models/user.ts
import { BaseModel } from "./BaseModels";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export interface User {
  user_id: string;
  username: string;
  email: string;
  password_hash: string;
  role: "parent" | "sponsor" | "volunteer" | "admin" | "case_reporter";
  status: "active" | "inactive" | "suspended";
  created_at: string;
  updated_at: string;
}

// Safe public profile
export interface UserProfile {
  user_id: string;
  username: string;
  email: string;
  role: User["role"];
  status: User["status"];
  created_at: string;
  updated_at: string;
}

export class UserModel extends BaseModel {
  static initDB() {
    this.init();
  }

  // ========================
  // CREATE & FIND
  // ========================
  static create(data: {
    username: string;
    email: string;
    password: string;
    role: User["role"];
  }): User {
    this.init();

    const id = `USR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const hash = bcrypt.hashSync(data.password, 10);

    this.db.prepare(`
      INSERT INTO users (user_id, username, email, password_hash, role, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'active', datetime('now'), datetime('now'))
    `).run(id, data.username, data.email, hash, data.role);

    return this.findById(id)!;
  }

  static findByEmail(email: string): User | null {
    this.init();
    return this.db.prepare("SELECT * FROM users WHERE email = ?").get(email) as User | null;
  }

  static findById(id: string): User | null {
    this.init();
    return this.db.prepare("SELECT * FROM users WHERE user_id = ?").get(id) as User | null;
  }

  static getProfile(userId: string): UserProfile | null {
    const user = this.findById(userId);
    if (!user) return null;
    const { password_hash, ...profile } = user;
    return profile;
  }

  static validatePassword(user: User, password: string): boolean {
    return bcrypt.compareSync(password, user.password_hash);
  }

  // ========================
  // PASSWORD RESET FLOW
  // ========================

  /**
   * Generate a secure reset token and store it with expiry (15 minutes)
   */
  static generatePasswordResetToken(email: string): { token: string; expiresAt: number } | null {
    this.init();

    const user = this.findByEmail(email);
    if (!user) return null;

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 60 * 60 * 1000; 

    
    this.db.prepare(`
      UPDATE users 
      SET reset_token = ?, reset_token_expires_at = ?
      WHERE user_id = ?
    `).run(token, expiresAt, user.user_id);

    return { token, expiresAt };
  }

  
  static verifyResetToken(token: string): User | null {
    this.init();

    const now = Date.now();
    const row = this.db.prepare(`
      SELECT * FROM users 
      WHERE reset_token = ? AND reset_token_expires_at > ?
    `).get(token, now) as User | undefined;

    if (!row) return null;

    
    this.db.prepare(`
      UPDATE users SET reset_token = NULL, reset_token_expires_at = NULL
      WHERE user_id = ?
    `).run(row.user_id);

    return row;
  }

  
  static resetPassword(token: string, newPassword: string): boolean {
    this.init();

    const user = this.verifyResetToken(token);
    if (!user) return false;

    const newHash = bcrypt.hashSync(newPassword, 10);

    const result = this.db.prepare(`
      UPDATE users 
      SET password_hash = ?, updated_at = datetime('now'),
          reset_token = NULL, reset_token_expires_at = NULL
      WHERE user_id = ?
    `).run(newHash, user.user_id);

    return result.changes > 0;
  }

 
  static suspend(id: string): boolean {
    this.init();
    const result = this.db.prepare(`
      UPDATE users SET status = 'suspended', updated_at = datetime('now')
      WHERE user_id = ?
    `).run(id);
    return result.changes > 0;
  }

  static activate(id: string): boolean {
    this.init();
    const result = this.db.prepare(`
      UPDATE users SET status = 'active', updated_at = datetime('now')
      WHERE user_id = ?
    `).run(id);
    return result.changes > 0;
  }

  static updateProfile(
    userId: string,
    data: { username?: string; email?: string }
  ): UserProfile | null {
    
    return this.getProfile(userId);
  }
  static toPublicProfile(user: User): UserProfile {
    const { user_id, username, email, role, status, created_at, updated_at } = user;
    return { user_id, username, email, role, status, created_at, updated_at };
}
}