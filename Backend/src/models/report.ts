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
// Prepared Statements
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

  // ------------------------
  // Submit Report (New Method)
  // ------------------------
  static submit(data: {
    reporter_id?: string;
    location: string;
    description?: string;
    child_name?: string;
    child_age?: number;
    photo_url?: string;
  }): Report {
    this.init();

    const report: Report = {
      report_id: crypto.randomUUID(),
      reporter_id: data.reporter_id ?? null,
      location: data.location,
      description: data.description ?? null,
      child_name: data.child_name ?? null,
      child_age: data.child_age ?? null,
      photo_url: data.photo_url ?? null,
      status: "pending",
      reported_at: new Date().toISOString()
    };

    insertStmt.run(
      report.report_id,
      report.reporter_id,
      report.location,
      report.description,
      report.child_name,
      report.child_age,
      report.photo_url,
      report.status,
      report.reported_at
    );

    return report;
  }

  // Create a new report (fully custom data)
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

    return this.findById(data.report_id)!;
  }

  // Find a report by ID
  static findById(id: string): Report | null {
    const row = selectByIdStmt.get(id) as Report | undefined;
    return row ?? null;
  }

  // Get all reports
  static findAll(): Report[] {
    return selectAllStmt.all() as Report[];
  }

  // Delete a report
  static deleteById(id: string): boolean {
    const result = deleteStmt.run(id);
    return result.changes > 0;
  }

  // Update status
  static updateStatus(id: string, status: string): Report | null {
    updateStatusStmt.run(status, id);
    return this.findById(id);
  }
}
