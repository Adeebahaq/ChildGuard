// src/models/Application.ts
import { BaseModel } from "./BaseModels";

export interface Application {
  application_id: string;
  child_id: string;
  sponsor_id: string;
  status: string;
  applied_at: string;  // ✅ Changed from application_date
}

const insert = BaseModel.db.prepare(`
  INSERT INTO applications (application_id, child_id, sponsor_id, status, applied_at)
  VALUES (?, ?, ?, ?, datetime('now'))
`);

const selectById = BaseModel.db.prepare(`
  SELECT * FROM applications WHERE application_id = ?
`);

const selectAll = BaseModel.db.prepare(`
  SELECT * FROM applications
`);

export class ApplicationModel extends BaseModel {
  static create(data: {
    application_id: string;
    child_id: string;
    sponsor_id: string;
    status: string;
  }): Application {
    insert.run(
      data.application_id,
      data.child_id,
      data.sponsor_id,
      data.status
    );
    return this.findById(data.application_id)!;
  }

  static findById(id: string): Application | null {
    return selectById.get(id) as Application | null;
  }

  static findAll(): Application[] {
    return selectAll.all() as Application[];
  }
}