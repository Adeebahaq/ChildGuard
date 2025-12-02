"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressReportModel = void 0;
const BaseModels_1 = require("./BaseModels");
const insert = BaseModels_1.BaseModel.db.prepare(`
  INSERT INTO progress_reports (report_id, child_id, report_date, grades, attendance, comments)
  VALUES (?, ?, ?, ?, ?, ?)
`);
const selectById = BaseModels_1.BaseModel.db.prepare(`SELECT * FROM progress_reports WHERE report_id = ?`);
const selectByChild = BaseModels_1.BaseModel.db.prepare(`SELECT * FROM progress_reports WHERE child_id = ?`);
class ProgressReportModel extends BaseModels_1.BaseModel {
    static create(data) {
        insert.run(data.report_id, data.child_id, data.report_date, data.grades, data.attendance, data.comments ?? null);
        return this.findById(data.report_id);
    }
    static findById(id) {
        return selectById.get(id);
    }
    static findByChild(child_id) {
        return selectByChild.all(child_id);
    }
}
exports.ProgressReportModel = ProgressReportModel;
