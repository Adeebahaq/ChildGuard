import { BaseModel } from "./BaseModels";

// ------------------------
// Report Interface
// ------------------------
export interface Report {
  report_id: string;
  reporter_id?: string | null;
  location: string;
  description?: string | null;
  child_name?: string | null;
  child_age?: number | null;
  photo_url?: string | null;
  status?: string;
  reported_at?: string;
}

// ------------------------
// Prepare Statements
// ------------------------
const insertStmt = BaseModel.db.prepare(`
  INSERT INTO reports 
  (report_id, reporter_id, location, description, child_name, child_age, photo_url, status, reported_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const selectByIdStmt = BaseModel.db.prepare(`SELECT * FROM reports WHERE report_id = ?`);
const selectAllStmt = BaseModel.db.prepare(`SELECT * FROM reports`);
const deleteStmt = BaseModel.db.prepare(`DELETE FROM reports WHERE report_id = ?`);
const updateStatusStmt = BaseModel.db.prepare(`UPDATE reports SET status = ? WHERE report_id = ?`);

// ------------------------
// Report Model
// ------------------------
export class ReportModel extends BaseModel {

  // Create a new report
  static create(data: Report): Report {
    insertStmt.run(
      data.report_id,
      data.reporter_id ?? null,
      data.location,
      data.description ?? null,
      data.child_name ?? null,
      data.child_age ?? null,
      data.photo_url ?? null,
      data.status ?? 'pending',
      data.reported_at ?? new Date().toISOString()
    );

    return this.findById(data.report_id)!; // Guaranteed to exist
  }

  // Find a report by ID
  static findById(id: string): Report | null {
    const row = selectByIdStmt.get(id) as Report | undefined;
    return row ?? null;
  }

  // Get all reports
  static findAll(): Report[] {
    const rows = selectAllStmt.all() as Report[];
    return rows;
  }

  // Delete a report by ID
  static deleteById(id: string): boolean {
    const result = deleteStmt.run(id);
    return result.changes > 0;
  }

  // Update the status of a report
  static updateStatus(id: string, status: string): Report | null {
    updateStatusStmt.run(status, id);
    return this.findById(id);
  }
}
