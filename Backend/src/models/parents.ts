// src/models/parents.ts
import { UserModel, User } from "./User"; 
import { BaseModel } from "./BaseModels";


export interface ParentExtension {
  parent_id: string;
  phone: string | null; 
  address: string | null; 
}


export type Parent = User & ParentExtension;

export class ParentModel extends BaseModel {
  static create(data: {
    username: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
  }): Parent { 
    this.init();

    
    const user = UserModel.create({
      username: data.username,
      email: data.email,
      password: data.password,
      role: "parent",
    });

    const insertParent = this.db.prepare(`
      INSERT INTO parents (parent_id, phone, address)
      VALUES (?, ?, ?)
    `);
   
    insertParent.run(user.user_id, data.phone ?? null, data.address ?? null);

    
    const extra = this.db.prepare("SELECT parent_id, phone, address FROM parents WHERE parent_id = ?").get(user.user_id) as ParentExtension;
    
    return { ...user, ...extra };
  }

  static find(user_id: string): Parent | null { 
    this.init();

    const user = UserModel.findById(user_id);
    if (!user || user.role !== "parent") return null;

    
    const extra = this.db.prepare("SELECT parent_id, phone, address FROM parents WHERE parent_id = ?").get(user_id) as ParentExtension;
    
    return { ...user, ...extra };
  }
}