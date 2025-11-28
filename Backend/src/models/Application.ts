import { BaseModel } from "./BaseModels";

export interface Application {
  application_id: string;
  child_id: string;
  sponsor_id: string;
  application_date: string;
  status: string;
}

const insert = BaseModel.db.prepare(`
  INSERT INTO applications (application_id, child_id, sponsor_id, application_date, status)
  VALUES (?, ?, ?, ?, ?)
`);

const selectById = BaseModel.db.prepare(`
  SELECT * FROM applications WHERE application_id = ?
`);

const selectAll = BaseModel.db.prepare(`
  SELECT * FROM applications
`);

export class ApplicationModel extends BaseModel {
  static create(data: Application): Application {
    insert.run(
      data.application_id,
      data.child_id,
      data.sponsor_id,
      data.application_date,
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



