"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportModel = void 0;
const BaseModels_1 = require("./BaseModels");
// ------------------------
// Prepare Statements
// ------------------------
const insertStmt = BaseModels_1.BaseModel.db.prepare(`
  INSERT INTO reports 
  (report_id, reporter_id, location, description, child_name, child_age, photo_url, status, reported_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
const selectByIdStmt = BaseModels_1.BaseModel.db.prepare(`SELECT * FROM reports WHERE report_id = ?`);
const selectAllStmt = BaseModels_1.BaseModel.db.prepare(`SELECT * FROM reports`);
const deleteStmt = BaseModels_1.BaseModel.db.prepare(`DELETE FROM reports WHERE report_id = ?`);
const updateStatusStmt = BaseModels_1.BaseModel.db.prepare(`UPDATE reports SET status = ? WHERE report_id = ?`);
// ------------------------
// Report Model
// ------------------------
class ReportModel extends BaseModels_1.BaseModel {
    // Create a new report
    static create(data) {
        insertStmt.run(data.report_id, data.reporter_id ?? null, data.location, data.description ?? null, data.child_name ?? null, data.child_age ?? null, data.photo_url ?? null, data.status ?? 'pending', data.reported_at ?? new Date().toISOString());
        return this.findById(data.report_id); // Guaranteed to exist
    }
    // Find a report by ID
    static findById(id) {
        const row = selectByIdStmt.get(id);
        return row ?? null;
    }
    // Get all reports
    static findAll() {
        const rows = selectAllStmt.all();
        return rows;
    }
    // Delete a report by ID
    static deleteById(id) {
        const result = deleteStmt.run(id);
        return result.changes > 0;
    }
    // Update the status of a report
    static updateStatus(id, status) {
        updateStatusStmt.run(status, id);
        return this.findById(id);
    }
}
exports.ReportModel = ReportModel;
