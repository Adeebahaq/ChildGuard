import { BaseModel } from "./BaseModels";

export interface Sponsor {
  sponsor_id: string;
  name: string;
  email: string;
  phone?: string | null;
  preferences?: string | null; // JSON string
  created_at?: string;
}

// Prepare Queries
const insertStmt = BaseModel.db.prepare(`
  INSERT INTO sponsors (sponsor_id, name, email, phone, preferences, created_at)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const selectByIdStmt = BaseModel.db.prepare(`
  SELECT * FROM sponsors WHERE sponsor_id = ?
`);

const selectAllStmt = BaseModel.db.prepare(`
  SELECT * FROM sponsors
`);

const deleteStmt = BaseModel.db.prepare(`
  DELETE FROM sponsors WHERE sponsor_id = ?
`);

const updateStmt = BaseModel.db.prepare(`
  UPDATE sponsors SET name=?, email=?, phone=?, preferences=? WHERE sponsor_id = ?
`);

export class SponsorModel extends BaseModel {
  static create(data: Sponsor): Sponsor {
    insertStmt.run(
      data.sponsor_id,
      data.name,
      data.email,
      data.phone ?? null,
      data.preferences ?? null,
      data.created_at ?? new Date().toISOString()
    );
    return this.findById(data.sponsor_id)!;
  }

  static findById(id: string): Sponsor | null {
    const row = selectByIdStmt.get(id) as Sponsor | undefined;
    return row ?? null;
  }

  static findAll(): Sponsor[] {
    return selectAllStmt.all() as Sponsor[];
  }

  static update(id: string, data: Partial<Sponsor>): Sponsor | null {
    updateStmt.run(
      data.name,
      data.email,
      data.phone ?? null,
      data.preferences ?? null,
      id
    );
    return this.findById(id);
  }

  static delete(id: string): boolean {
    const result = deleteStmt.run(id);
    return result.changes > 0;
  }
}
