"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationModel = void 0;
// src/models/Application.ts
const BaseModels_1 = require("./BaseModels");
const insert = BaseModels_1.BaseModel.db.prepare(`
  INSERT INTO applications (application_id, child_id, sponsor_id, status, applied_at)
  VALUES (?, ?, ?, ?, datetime('now'))
`);
const selectById = BaseModels_1.BaseModel.db.prepare(`
  SELECT * FROM applications WHERE application_id = ?
`);
const selectAll = BaseModels_1.BaseModel.db.prepare(`
  SELECT * FROM applications
`);
class ApplicationModel extends BaseModels_1.BaseModel {
    static create(data) {
        insert.run(data.application_id, data.child_id, data.sponsor_id, data.status);
        return this.findById(data.application_id);
    }
    static findById(id) {
        return selectById.get(id);
    }
    static findAll() {
        return selectAll.all();
    }
}
exports.ApplicationModel = ApplicationModel;
