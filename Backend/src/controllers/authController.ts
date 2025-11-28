// src/controllers/authController.ts
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { DatabaseConnection } from "../config/database/DatabaseConnection";
import { User } from "../models/User";

type AuthDbUser = Pick<User, 'user_id' | 'username' | 'email' | 'password_hash' | 'role'>;
type AuthResponseUser = Omit<AuthDbUser, 'password_hash'>;

const JWT_SECRET = "your_jwt_secret";

export class AuthController {
   
    static register(req: Request, res: Response) {
        try {
            const db = DatabaseConnection.getInstance();
            const { username, email, password, role, phone, address, area } = req.body;

            const allowedRoles = ["parent", "sponsor", "volunteer", "admin", "case_reporter"];
            if (!allowedRoles.includes(role)) {
                return res.status(400).json({ error: "Invalid user role" });
            }

            
            const existing = db.prepare("SELECT * FROM users WHERE email = ? OR username = ?")
                               .get(email, username);
            if (existing) return res.status(400).json({ error: "User already exists" });

            
            const hash = bcrypt.hashSync(password, 10);

            
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
                        `).run(
                            user_id,
                            phone ?? null,
                            area ?? null,
                            "pending"
                        );
                        break;

                    default:
                        break;
                }

                
                return db.prepare(`
                    SELECT user_id, username, email, role FROM users WHERE user_id = ?
                `).get(user_id) as AuthResponseUser;
            })();

            
            const token = jwt.sign({ user_id: newUser.user_id, role: newUser.role }, JWT_SECRET, { expiresIn: "1h" });

            res.status(201).json({
                message: "Registration successful",
                user: newUser,
                token,
            });
        } catch (err) {
            console.error("Registration error:", err);
            res.status(500).json({ 
                error: "Registration failed", 
                details: err instanceof Error ? err.message : String(err) 
            });
        }
    }

   
    static login(req: Request, res: Response) {
        try {
            const db = DatabaseConnection.getInstance();
            const { email, password } = req.body;

            const user = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email) as AuthDbUser | undefined;
            if (!user) return res.status(400).json({ error: "User not found" });

            const valid = bcrypt.compareSync(password, user.password_hash);
            if (!valid) return res.status(400).json({ error: "Invalid password" });

            const token = jwt.sign({ user_id: user.user_id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });

            res.json({
                message: "Login successful",
                token,
                user: {
                    user_id: user.user_id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                } as AuthResponseUser,
            });
        } catch (err) {
            console.error("Login error:", err);
            res.status(500).json({ 
                error: "Login failed", 
                details: err instanceof Error ? err.message : String(err) 
            });
        }
    }
}
