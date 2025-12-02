"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitModel = void 0;
// src/models/Visit.ts
const BaseModels_1 = require("./BaseModels");
class VisitModel extends BaseModels_1.BaseModel {
    static async getAllByVolunteer(volunteer_id) {
        this.init();
        const rows = this.db
            .prepare(`SELECT * FROM verification_visits WHERE volunteer_id = ? ORDER BY visit_date ASC`)
            .all(volunteer_id);
        return rows;
    }
    static async getById(visit_id) {
        this.init();
        const row = this.db
            .prepare(`SELECT * FROM verification_visits WHERE visit_id = ?`)
            .get(visit_id);
        return row ?? null;
    }
    static async acceptVisit(visit_id) {
        this.init();
        this.db
            .prepare(`
        UPDATE verification_visits
        SET status = 'accepted', accepted_at = datetime('now')
        WHERE visit_id = ? AND status = 'assigned'
      `)
            .run(visit_id);
        return this.getById(visit_id);
    }
    static async completeVisit(visit_id, findings) {
        this.init();
        this.db
            .prepare(`
        UPDATE verification_visits
        SET status = 'completed', findings = ?, completed_at = datetime('now')
        WHERE visit_id = ? AND status IN ('assigned','accepted')
      `)
            .run(findings ?? null, visit_id);
        return this.getById(visit_id);
    }
    static async createVisit(data) {
        this.init();
        const visit_id = `VIS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        this.db
            .prepare(`
        INSERT INTO verification_visits (visit_id, volunteer_id, target_id, target_type, visit_date)
        VALUES (?, ?, ?, ?, ?)
      `)
            .run(visit_id, data.volunteer_id, data.target_id, data.target_type, data.visit_date ?? null);
        return this.getById(visit_id);
    }
}
exports.VisitModel = VisitModel;
