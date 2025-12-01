import { BaseModel } from "./BaseModels";

export interface ProgressReport {
  report_id: string;
  child_id: string;
  report_date: string;
  grades: string;
  attendance: number;
  comments?: string;
}

const insert = BaseModel.db.prepare(`
  INSERT INTO progress_reports (report_id, child_id, report_date, grades, attendance, comments)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const selectById = BaseModel.db.prepare(`SELECT * FROM progress_reports WHERE report_id = ?`);
const selectByChild = BaseModel.db.prepare(`SELECT * FROM progress_reports WHERE child_id = ?`);

export class ProgressReportModel extends BaseModel {
  static create(data: ProgressReport): ProgressReport {
    insert.run(
      data.report_id,
      data.child_id,
      data.report_date,
      data.grades,
      data.attendance,
      data.comments ?? null
    );
    return this.findById(data.report_id)!;
  }

 static findById(id: string): ProgressReport | null {
  return selectById.get(id) as ProgressReport | null;
}

  static findByChild(child_id: string): ProgressReport[] {
    return selectByChild.all(child_id) as ProgressReport[];
  }
}
