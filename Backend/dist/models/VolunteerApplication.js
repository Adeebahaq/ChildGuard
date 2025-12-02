"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolunteerApplicationModel = void 0;
const BaseModels_1 = require("./BaseModels");
const insert = BaseModels_1.BaseModel.db.prepare(`
  INSERT INTO volunteer_applications (application_id, volunteer_id, apply_date, status)
  VALUES (?, ?, ?, ?)
`);
const selectById = BaseModels_1.BaseModel.db.prepare(`SELECT * FROM volunteer_applications WHERE application_id = ?`);
class VolunteerApplicationModel extends BaseModels_1.BaseModel {
    static create(data) {
        insert.run(data.application_id, data.volunteer_id, data.apply_date, data.status);
        return this.findById(data.application_id);
    }
    static findById(id) {
        return selectById.get(id);
    }
}
exports.VolunteerApplicationModel = VolunteerApplicationModel;
