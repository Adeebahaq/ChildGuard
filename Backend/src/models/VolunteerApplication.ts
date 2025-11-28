import { BaseModel } from "./BaseModels";

export interface VolunteerApplication {
  application_id: string;
  volunteer_id: string;
  apply_date: string;
  status: string;
}

const insert = BaseModel.db.prepare(`
  INSERT INTO volunteer_applications (application_id, volunteer_id, apply_date, status)
  VALUES (?, ?, ?, ?)
`);

const selectById = BaseModel.db.prepare(`SELECT * FROM volunteer_applications WHERE application_id = ?`);

export class VolunteerApplicationModel extends BaseModel {
  static create(data: VolunteerApplication): VolunteerApplication {
    insert.run(
      data.application_id,
      data.volunteer_id,
      data.apply_date,
      data.status
    );
    return this.findById(data.application_id)!;
  }

  static findById(id: string): VolunteerApplication | null {
    return selectById.get(id) as VolunteerApplication | null;
}

}
