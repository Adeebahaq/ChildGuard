"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeeChallanModel = void 0;
// src/models/FeeChallan.ts
const BaseModels_1 = require("./BaseModels");
// Initialize DB connection (critical!)
BaseModels_1.BaseModel.init();
class FeeChallanModel extends BaseModels_1.BaseModel {
    // === SAFE PREPARED STATEMENTS ===
    static get insertStmt() {
        return this.db.prepare(`
      INSERT INTO fee_challans 
      (challan_id, application_id, child_id, amount, challan_url, status, issued_at, due_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'pending', datetime('now'), datetime('now', '+15 days'), datetime('now'), datetime('now'))
    `);
    }
    static get getByIdStmt() {
        return this.db.prepare('SELECT * FROM fee_challans WHERE challan_id = ?');
    }
    static get getByApplicationStmt() {
        return this.db.prepare('SELECT * FROM fee_challans WHERE application_id = ? ORDER BY created_at DESC');
    }
    static get getByChildIdStmt() {
        return this.db.prepare('SELECT * FROM fee_challans WHERE child_id = ? ORDER BY created_at DESC');
    }
    static get markAsPaidStmt() {
        return this.db.prepare(`
      UPDATE fee_challans 
      SET status = 'paid', paid_at = datetime('now'), updated_at = datetime('now')
      WHERE challan_id = ?
    `);
    }
    static get expireOldStmt() {
        return this.db.prepare(`
      UPDATE fee_challans 
      SET status = 'expired' 
      WHERE status = 'pending' AND due_date < datetime('now')
    `);
    }
    // === CREATE CHALLAN ===
    static create(data) {
        const challan_id = `CHL${Date.now()}${Math.floor(Math.random() * 999)}`.slice(-12);
        this.insertStmt.run(challan_id, data.application_id, data.child_id, // No more || null
        data.amount, data.challan_url);
        return this.getById(challan_id);
    }
    // === GET ONE ===
    static getById(challan_id) {
        return this.getByIdStmt.get(challan_id);
    }
    static getByApplication(application_id) {
        return this.getByApplicationStmt.all(application_id);
    }
    // === GET BY CHILD ID ===
    static getByChildId(child_id) {
        return this.getByChildIdStmt.all(child_id);
    }
    // === MARK AS PAID ===
    static markAsPaid(challan_id) {
        const result = this.markAsPaidStmt.run(challan_id);
        if (result.changes === 0)
            throw new Error('Challan not found or already paid');
    }
    // === EXPIRE OLD CHALLANS (run daily via cron or endpoint) ===
    static expireOldChallans() {
        const result = this.expireOldStmt.run();
        return result.changes;
    }
}
exports.FeeChallanModel = FeeChallanModel;
