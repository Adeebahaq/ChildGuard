// src/models/admin.ts  

import { BaseModel } from "./BaseModels";
import { Volunteer } from "./volunteer";
import { VolunteerModel } from "./volunteer";

export class AdminModel extends BaseModel {
    static initDB() {
        if (!this.db) this.init();
    }

    // ==================== VOLUNTEER REQUEST MANAGEMENT ====================
    static async getAllVolunteers(): Promise<Volunteer[]> {
        this.initDB();
        const rows = this.db
            .prepare(
                "SELECT volunteer_id, phone, availability, area, age, status FROM volunteers"
            )
            .all() as Volunteer[];
        return rows;
    }

    static async getRequestedVolunteers(): Promise<Volunteer[]> {
        this.initDB();
        const rows = this.db
            .prepare(
                "SELECT volunteer_id, phone, availability, area, age, status FROM volunteers WHERE status = 'requested'"
            )
            .all() as Volunteer[];
        return rows;
    }

    static async approveVolunteer(volunteerId: string): Promise<Volunteer | null> {
        this.initDB();
        const volunteer = await VolunteerModel.getById(volunteerId);
        if (!volunteer) return null;

        if (volunteer.age !== null && volunteer.age < 18) {
            return this.rejectVolunteer(volunteerId);
        }

        const result = this.db
            .prepare(
                "UPDATE volunteers SET status = 'approved' WHERE volunteer_id = ?"
            )
            .run(volunteerId);
        if (result.changes === 0) return null;
        return VolunteerModel.getById(volunteerId);
    }

    static async rejectVolunteer(volunteerId: string): Promise<Volunteer | null> {
        this.initDB();
        const result = this.db
            .prepare(
                "UPDATE volunteers SET status = 'rejected' WHERE volunteer_id = ?"
            )
            .run(volunteerId);
        if (result.changes === 0) return null;
        return VolunteerModel.getById(volunteerId);
    }

    // ==================== FAMILY REQUEST MANAGEMENT (EXACT SAME AS VOLUNTEERS) ====================
    static async getRequestedFamilies(): Promise<any[]> {
        this.initDB();
        const rows = this.db
            .prepare(`
                SELECT 
                    f.family_id,
                    f.parent_id,
                    f.income,
                    f.address,
                    f.number_of_children,
                    f.verification_status,
                    u.username AS parent_name,
                    u.email AS parent_email
                FROM families f
                JOIN users u ON f.parent_id = u.user_id
                WHERE f.verification_status = 'pending'
                ORDER BY f.created_at DESC
            `)
            .all();
        return rows;
    }

    static async getApprovedFamilies(): Promise<any[]> {
        this.initDB();
        const rows = this.db
            .prepare(`
                SELECT 
                    f.family_id,
                    f.parent_id,
                    f.income,
                    f.address,
                    f.number_of_children,
                    f.verification_status,
                    u.username AS parent_name,
                    u.email AS parent_email
                FROM families f
                JOIN users u ON f.parent_id = u.user_id
                WHERE f.verification_status = 'verified'
                ORDER BY f.created_at DESC
            `)
            .all();
        return rows;
    }

    static async getRejectedFamilies(): Promise<any[]> {
        this.initDB();
        const rows = this.db
            .prepare(`
                SELECT 
                    f.family_id,
                    f.parent_id,
                    f.income,
                    f.address,
                    f.number_of_children,
                    f.verification_status,
                    u.username AS parent_name,
                    u.email AS parent_email
                FROM families f
                JOIN users u ON f.parent_id = u.user_id
                WHERE f.verification_status = 'rejected'
                ORDER BY f.created_at DESC
            `)
            .all();
        return rows;
    }

    // FINAL FIXED: Approve family — returns full family data with parent name/email
    static async approveFamily(familyId: string): Promise<any | null> {
        this.initDB();
        const result = this.db
            .prepare("UPDATE families SET verification_status = 'verified' WHERE family_id = ?")
            .run(familyId);

        if (result.changes === 0) return null;

        // RETURN FULL FAMILY WITH PARENT NAME/EMAIL — THIS IS THE KEY FIX
        return this.db.prepare(`
            SELECT 
                f.*,
                u.username AS parent_name,
                u.email AS parent_email
            FROM families f
            JOIN users u ON f.parent_id = u.user_id
            WHERE f.family_id = ?
        `).get(familyId);
    }

    // FINAL FIXED: Reject family — returns full family data
    static async rejectFamily(familyId: string): Promise<any | null> {
        this.initDB();
        const result = this.db
            .prepare("UPDATE families SET verification_status = 'rejected' WHERE family_id = ?")
            .run(familyId);

        if (result.changes === 0) return null;

        // RETURN FULL FAMILY WITH PARENT NAME/EMAIL
        return this.db.prepare(`
            SELECT 
                f.*,
                u.username AS parent_name,
                u.email AS parent_email
            FROM families f
            JOIN users u ON f.parent_id = u.user_id
            WHERE f.family_id = ?
        `).get(familyId);
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

    static async assignVolunteerToReport(reportId: string, volunteerId: string) {
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

    static async getReportById(reportId: string) {
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

export default AdminModel;