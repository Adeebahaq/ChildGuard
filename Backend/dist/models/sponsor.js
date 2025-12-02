"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SponsorModel = void 0;
const BaseModels_1 = require("./BaseModels");
// Prepare Queries
const insertStmt = BaseModels_1.BaseModel.db.prepare(`
  INSERT INTO sponsors (sponsor_id, name, email, phone, preferences, created_at)
  VALUES (?, ?, ?, ?, ?, ?)
`);
const selectByIdStmt = BaseModels_1.BaseModel.db.prepare(`
  SELECT * FROM sponsors WHERE sponsor_id = ?
`);
const selectAllStmt = BaseModels_1.BaseModel.db.prepare(`
  SELECT * FROM sponsors
`);
const deleteStmt = BaseModels_1.BaseModel.db.prepare(`
  DELETE FROM sponsors WHERE sponsor_id = ?
`);
const updateStmt = BaseModels_1.BaseModel.db.prepare(`
  UPDATE sponsors SET name=?, email=?, phone=?, preferences=? WHERE sponsor_id = ?
`);
class SponsorModel extends BaseModels_1.BaseModel {
    static create(data) {
        insertStmt.run(data.sponsor_id, data.name, data.email, data.phone ?? null, data.preferences ?? null, data.created_at ?? new Date().toISOString());
        return this.findById(data.sponsor_id);
    }
    static findById(id) {
        const row = selectByIdStmt.get(id);
        return row ?? null;
    }
    static findAll() {
        return selectAllStmt.all();
    }
    static update(id, data) {
        updateStmt.run(data.name, data.email, data.phone ?? null, data.preferences ?? null, id);
        return this.findById(id);
    }
    static delete(id) {
        const result = deleteStmt.run(id);
        return result.changes > 0;
    }
}
exports.SponsorModel = SponsorModel;
