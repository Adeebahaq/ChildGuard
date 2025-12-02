"use strict";
// src/models/admin.ts  
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModel = void 0;
const BaseModels_1 = require("./BaseModels");
const volunteer_1 = require("./volunteer");
class AdminModel extends BaseModels_1.BaseModel {
    static initDB() {
        if (!this.db)
            this.init();
    }
    // Volunteer Management Functions
    static async getAllVolunteers() {
        this.initDB();
        const rows = this.db
            .prepare("SELECT volunteer_id, phone, availability, area, age, status FROM volunteers")
            .all();
        return rows;
    }
    static async getRequestedVolunteers() {
        this.initDB();
        const rows = this.db
            .prepare("SELECT volunteer_id, phone, availability, area, age, status FROM volunteers WHERE status = 'requested'")
            .all();
        return rows;
    }
    static async approveVolunteer(volunteerId) {
        this.initDB();
        const volunteer = await volunteer_1.VolunteerModel.getById(volunteerId);
        if (!volunteer)
            return null;
        if (volunteer.age !== null && volunteer.age < 18) {
            return this.rejectVolunteer(volunteerId);
        }
        const result = this.db
            .prepare("UPDATE volunteers SET status = 'approved' WHERE volunteer_id = ?")
            .run(volunteerId);
        if (result.changes === 0)
            return null;
        return volunteer_1.VolunteerModel.getById(volunteerId);
    }
    static async rejectVolunteer(volunteerId) {
        this.initDB();
        const result = this.db
            .prepare("UPDATE volunteers SET status = 'rejected' WHERE volunteer_id = ?")
            .run(volunteerId);
        if (result.changes === 0)
            return null;
        return volunteer_1.VolunteerModel.getById(volunteerId);
    }
    // ==================== CASE REPORTS MANAGEMENT ====================
    static async getAllReports() {
        this.initDB();
        return this.db
            .prepare(`
                SELECT 
                    r.*,
                    cr.phone AS reporter_phone,
                    cr.is_anonymous
                FROM reports r
                LEFT JOIN case_reporters cr ON r.reporter_id = cr.reporter_id
                ORDER BY r.reported_at DESC
            `)
            .all();
    }
    static async assignVolunteerToReport(reportId, volunteerId) {
        this.initDB();
        const result = this.db
            .prepare(`
                UPDATE reports 
                SET status = 'action_taken', assigned_volunteer_id = ? 
                WHERE report_id = ?
            `)
            .run(volunteerId, reportId);
        return result.changes > 0;
    }
    static async getReportById(reportId) {
        this.initDB();
        return this.db
            .prepare(`
                SELECT 
                    r.*,
                    cr.phone AS reporter_phone,
                    cr.is_anonymous
                FROM reports r
                LEFT JOIN case_reporters cr ON r.reporter_id = cr.reporter_id
                WHERE r.report_id = ?
            `)
            .get(reportId);
    }
}
exports.AdminModel = AdminModel;
exports.default = AdminModel;
