// src/models/parents.ts
import { UserModel, User } from "./User";
import { BaseModel } from "./BaseModels";

// Extra fields stored in the "parents" table
export interface ParentExtension {
  parent_id: string;
  phone: string | null;
  address: string | null;
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
      INSERT INTO parents (parent_id, phone, address)
      VALUES (?, ?, ?)
    `);

    insertParent.run(
      user.user_id,
      data.phone ?? null,
      data.address ?? null
    );

    // 3. Retrieve the parent extension fields
    const extra = this.db.prepare(`
      SELECT parent_id, phone, address
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
      SELECT parent_id, phone, address
      FROM parents
      WHERE parent_id = ?
    `).get(user_id) as ParentExtension;

    if (!extra) return null;

    // 3. Return merged parent object
    return { ...user, ...extra };
  }
}
