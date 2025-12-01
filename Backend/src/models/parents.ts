// src/models/parents.ts
import { UserModel, User } from "./User";
import { BaseModel } from "./BaseModels";

// Extra fields stored in the "parents" table
export interface ParentExtension {
  parent_id: string;
  phone: string | null;
  address: string | null;
  cnic: string | null; // ADDED: CNIC field
}

// Final return type for parent objects
export type Parent = User & ParentExtension;

export class ParentModel extends BaseModel {
  // -------------------------
  // CREATE NEW PARENT ACCOUNT
  // -------------------------
  static create(data: {
    username: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    cnic?: string; // ADDED: Optional CNIC during registration
  }): Parent {
    this.init();

    // 1. Create main user in the "users" table
    const user = UserModel.create({
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

    insertParent.run(
      user.user_id,
      data.phone ?? null,
      data.address ?? null,
      data.cnic ?? null // ADDED: CNIC field
    );

    // 3. Retrieve the parent extension fields
    const extra = this.db.prepare(`
      SELECT parent_id, phone, address, cnic
      FROM parents
      WHERE parent_id = ?
    `).get(user.user_id) as ParentExtension;

    // 4. Merge user + parent extension and return final parent object
    return { ...user, ...extra };
  }

  // ------------------------------------------
  // FIND PARENT BY USER ID (used for dashboard)
  // ------------------------------------------
  static find(user_id: string): Parent | null {
    this.init();

    // 1. Fetch main user
    const user = UserModel.findById(user_id);
    if (!user) return null;

    // Parent check (ensures no volunteers/admin load parent dashboard)
    if (user.role !== "parent") return null;

    // 2. Get parent extension fields
    const extra = this.db.prepare(`
      SELECT parent_id, phone, address, cnic
      FROM parents
      WHERE parent_id = ?
    `).get(user_id) as ParentExtension;

    if (!extra) return null;

    // 3. Return merged parent object
    return { ...user, ...extra };
  }

  // ------------------------------------------
  // FIND PARENT BY CNIC (for duplicate check)
  // ------------------------------------------
  static findByCnic(cnic: string): Parent | null {
    this.init();

    const extra = this.db.prepare(`
      SELECT parent_id, phone, address, cnic
      FROM parents
      WHERE cnic = ?
    `).get(cnic) as ParentExtension;

    if (!extra) return null;

    // Fetch the full user data
    const user = UserModel.findById(extra.parent_id);
    if (!user) return null;

    return { ...user, ...extra };
  }

  // ------------------------------------------
  // UPDATE PARENT INFO (phone, address, cnic)
  // ------------------------------------------
  static updateInfo(
    parent_id: string, 
    data: { 
      phone?: string; 
      address?: string; 
      cnic?: string;
    }
  ): Parent | null {
    this.init();

    // Build dynamic update query
    const fields: string[] = [];
    const values: any[] = [];

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
  static getAll(): Parent[] {
    this.init();

    const parents = this.db.prepare(`
      SELECT 
        u.user_id, u.username, u.email, u.role, u.created_at,
        p.parent_id, p.phone, p.address, p.cnic
      FROM users u
      INNER JOIN parents p ON u.user_id = p.parent_id
      WHERE u.role = 'parent'
      ORDER BY u.created_at DESC
    `).all() as Parent[];

    return parents;
  }
}