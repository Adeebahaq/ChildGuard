"use strict";
// src/models/caseReporter.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaseReporterModel = void 0;
const BaseModels_1 = require("./BaseModels");
class CaseReporterModel extends BaseModels_1.BaseModel {
    static reportCase(data) {
        this.init();
        const reporterId = `REP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const reportId = `RPT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        this.db.prepare(`
      INSERT INTO case_reporters (reporter_id, user_id, phone, is_anonymous)
      VALUES (?, ?, ?, ?)
    `).run(reporterId, data.user_id ?? null, data.phone ?? null, data.is_anonymous ? 1 : 0);
        this.db.prepare(`
      INSERT INTO reports (report_id, reporter_id, location, description, child_name, child_age, photo_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(reportId, reporterId, data.location, data.description, data.child_name ?? null, data.child_age ?? null, data.photo_url ?? null);
        const report = this.db.prepare("SELECT * FROM reports WHERE report_id = ?").get(reportId);
        return report;
    }
}
exports.CaseReporterModel = CaseReporterModel;
