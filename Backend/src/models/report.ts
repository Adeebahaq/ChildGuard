// src/models/report.ts
import { BaseModel } from "./BaseModels";

export interface Report {
  report_id: string;
  reporter_id?: string | null;
  location: string;
  description: string;
  child_name?: string | null;
  child_age?: number | null;
  photo_url?: string | null;
  status: 'pending' | 'under_verification' | 'verified' | 'action_taken' | 'rejected';
  reported_at: string;
}

export class ReportModel extends BaseModel {
  
  static submit(data: {
    reporter_id?: string;
    location: string;
    description: string;
    child_name?: string;
    child_age?: number;
    photo_url?: string;
  }): Report {
    this.init();

    const reportId = `RPT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const insert = this.db.prepare(`
      INSERT INTO reports (report_id, reporter_id, location, description, child_name, child_age, photo_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      reportId,
      data.reporter_id || null,
      data.location,
      data.description,
      data.child_name || null,
      data.child_age || null,
      data.photo_url || null
    );

    const report = this.db
      .prepare("SELECT * FROM reports WHERE report_id = ?")
      .get(reportId) as Report;

    return report;
  }

  static findById(report_id: string): Report | null {
    this.init();
    return this.db
      .prepare("SELECT * FROM reports WHERE report_id = ?")
      .get(report_id) as Report | null;
  }
}
