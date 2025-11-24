// src/models/sponsor.ts
import { UserModel, User } from "./User"; // Import User
import { BaseModel } from "./BaseModels";

// Define the Sponsor extension fields
export interface SponsorExtension {
  sponsor_id: string;
  phone: string | null;
  preferences: string | null; // Stored as TEXT (JSON string) in DB
}

// Define the merged object type returned by create/find
export type Sponsor = User & SponsorExtension;

export class SponsorModel extends BaseModel {
  static create(data: {
    username: string;
    email: string;
    password: string;
    phone?: string;
    preferences?: any; // array or object
  }): Sponsor { // Explicit return type
    this.init();

    const user = UserModel.create({
      username: data.username,
      email: data.email,
      password: data.password,
      role: "sponsor",
    });

    // Stringify preferences to store as TEXT/JSON string in SQLite
    const prefsJson = data.preferences ? JSON.stringify(data.preferences) : null;

    const insertSponsor = this.db.prepare(`
      INSERT INTO sponsors (sponsor_id, phone, preferences)
      VALUES (?, ?, ?)
    `);
    insertSponsor.run(user.user_id, data.phone ?? null, prefsJson);

    // Select the extension fields
    const extra = this.db.prepare("SELECT sponsor_id, phone, preferences FROM sponsors WHERE sponsor_id = ?").get(user.user_id) as SponsorExtension;
    // Merge and return
    return { ...user, ...extra };
  }

  static find(user_id: string): Sponsor | null { // Explicit return type
    this.init();

    const user = UserModel.findById(user_id);
    if (!user || user.role !== "sponsor") return null;

    // Select the extension fields
    const extra = this.db.prepare("SELECT sponsor_id, phone, preferences FROM sponsors WHERE sponsor_id = ?").get(user_id) as SponsorExtension;
    // Merge and return
    return { ...user, ...extra };
  }
}