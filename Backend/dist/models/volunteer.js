"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolunteerModel = void 0;
const BaseModels_1 = require("./BaseModels");
class VolunteerModel extends BaseModels_1.BaseModel {
    static initDB() {
        if (!this.db)
            this.init();
    }
    static async getById(volunteerId) {
        this.initDB();
        const row = this.db
            .prepare("SELECT volunteer_id, phone, availability, area, age, status FROM volunteers WHERE volunteer_id = ?")
            .get(volunteerId);
        return row ?? null;
    }
    static async getByUserId(userId) {
        return this.getById(userId);
    }
    static async create(volunteerId) {
        this.initDB();
        this.db
            .prepare(`INSERT INTO volunteers (volunteer_id, phone, availability, area, age, status)
                 VALUES (?, NULL, NULL, NULL, 18, 'pending')` // <-- default age 18
        )
            .run(volunteerId);
        return this.getById(volunteerId);
    }
    static async updateAvailability(volunteerId, availability) {
        this.initDB();
        const result = this.db
            .prepare(`
                UPDATE volunteers 
                SET availability = ? 
                WHERE volunteer_id = ?
            `)
            .run(JSON.stringify(availability), volunteerId);
        if (result.changes === 0)
            return null;
        return this.getById(volunteerId);
    }
    static async requestApproval(volunteerId, data) {
        this.initDB();
        const result = this.db
            .prepare(`
                UPDATE volunteers
                SET 
                    phone = ?, 
                    area = ?, 
                    age = ?,                          -- <-- update age
                    availability = ?, 
                    status = 'requested'
                WHERE volunteer_id = ?
            `)
            .run(data.phone, data.area, data.age, JSON.stringify(data.availability), volunteerId);
        if (result.changes === 0)
            return null;
        return this.getById(volunteerId);
    }
}
exports.VolunteerModel = VolunteerModel;
