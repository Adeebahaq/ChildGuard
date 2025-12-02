"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParentModel = void 0;
// src/models/parents.ts
const User_1 = require("./User");
const BaseModels_1 = require("./BaseModels");
class ParentModel extends BaseModels_1.BaseModel {
    // -------------------------
    // CREATE NEW PARENT ACCOUNT
    // -------------------------
    static create(data) {
        this.init();
        // 1. Create main user in the "users" table
        const user = User_1.UserModel.create({
            username: data.username,
            email: data.email,
            password: data.password,
            role: "parent",
        });
        // 2. Insert into "parents" table
        const insertParent = this.db.prepare(`
      INSERT INTO parents (parent_id, phone, address, cnic)
      VALUES (?, ?, ?, ?)
    `);
        insertParent.run(user.user_id, data.phone ?? null, data.address ?? null, data.cnic ?? null // ADDED: CNIC field
        );
        // 3. Retrieve the parent extension fields
        const extra = this.db.prepare(`
      SELECT parent_id, phone, address, cnic
      FROM parents
      WHERE parent_id = ?
    `).get(user.user_id);
        // 4. Merge user + parent extension and return final parent object
        return { ...user, ...extra };
    }
    // ------------------------------------------
    // FIND PARENT BY USER ID (used for dashboard)
    // ------------------------------------------
    static find(user_id) {
        this.init();
        // 1. Fetch main user
        const user = User_1.UserModel.findById(user_id);
        if (!user)
            return null;
        // Parent check (ensures no volunteers/admin load parent dashboard)
        if (user.role !== "parent")
            return null;
        // 2. Get parent extension fields
        const extra = this.db.prepare(`
      SELECT parent_id, phone, address, cnic
      FROM parents
      WHERE parent_id = ?
    `).get(user_id);
        if (!extra)
            return null;
        // 3. Return merged parent object
        return { ...user, ...extra };
    }
    // ------------------------------------------
    // FIND PARENT BY CNIC (for duplicate check)
    // ------------------------------------------
    static findByCnic(cnic) {
        this.init();
        const extra = this.db.prepare(`
      SELECT parent_id, phone, address, cnic
      FROM parents
      WHERE cnic = ?
    `).get(cnic);
        if (!extra)
            return null;
        // Fetch the full user data
        const user = User_1.UserModel.findById(extra.parent_id);
        if (!user)
            return null;
        return { ...user, ...extra };
    }
    // ------------------------------------------
    // UPDATE PARENT INFO (phone, address, cnic)
    // ------------------------------------------
    static updateInfo(parent_id, data) {
        this.init();
        // Build dynamic update query
        const fields = [];
        const values = [];
        if (data.phone !== undefined) {
            fields.push('phone = ?');
            values.push(data.phone);
        }
        if (data.address !== undefined) {
            fields.push('address = ?');
            values.push(data.address);
        }
        if (data.cnic !== undefined) {
            fields.push('cnic = ?');
            values.push(data.cnic);
        }
        if (fields.length === 0) {
            // Nothing to update
            return this.find(parent_id);
        }
        values.push(parent_id); // Add parent_id for WHERE clause
        const updateQuery = `
      UPDATE parents 
      SET ${fields.join(', ')}
      WHERE parent_id = ?
    `;
        const stmt = this.db.prepare(updateQuery);
        stmt.run(...values);
        // Return updated parent
        return this.find(parent_id);
    }
    // ------------------------------------------
    // GET ALL PARENTS (for admin view)
    // ------------------------------------------
    static getAll() {
        this.init();
        const parents = this.db.prepare(`
      SELECT 
        u.user_id, u.username, u.email, u.role, u.created_at,
        p.parent_id, p.phone, p.address, p.cnic
      FROM users u
      INNER JOIN parents p ON u.user_id = p.parent_id
      WHERE u.role = 'parent'
      ORDER BY u.created_at DESC
    `).all();
        return parents;
    }
}
exports.ParentModel = ParentModel;
