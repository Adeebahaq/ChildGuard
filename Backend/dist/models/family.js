"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FamilyModel = void 0;
// src/models/Family.ts
const BaseModels_1 = require("./BaseModels");
const childprofile_1 = require("./childprofile");
// === ENSURE DB IS INITIALIZED ===
BaseModels_1.BaseModel.init(); // ← MUST BE FIRST
class FamilyModel extends BaseModels_1.BaseModel {
    // ---------------------------------------------
    // STATIC PREPARED STATEMENTS
    // ---------------------------------------------
    static get insertFamily() {
        return this.db.prepare(`
      INSERT INTO families (
        family_id, parent_id, income, address, proof_documents,
        number_of_children, verification_status, support_status
      ) 
      VALUES (?, ?, ?, ?, ?, 0, 'pending', 'none')
    `);
    }
    static get getByIdStmt() {
        return this.db.prepare(`
      SELECT 
        f.*,
        u.username AS parent_name,
        u.email AS parent_email
      FROM families f
      JOIN users u ON f.parent_id = u.user_id
      WHERE f.family_id = ?
    `);
    }
    static get getByParentIdStmt() {
        return this.db.prepare(`
      SELECT 
        f.*,
        u.username AS parent_name,
        u.email AS parent_email
      FROM families f
      JOIN users u ON f.parent_id = u.user_id
      WHERE f.parent_id = ?
    `);
    }
    static get getAllStmt() {
        return this.db.prepare(`
      SELECT 
        f.*,
        u.username AS parent_name,
        u.email AS parent_email
      FROM families f
      JOIN users u ON f.parent_id = u.user_id
      ORDER BY f.created_at DESC
    `);
    }
    static get updateVerificationStmt() {
        return this.db.prepare(`
      UPDATE families 
      SET verification_status = ?, verified_by = ?, updated_at = datetime('now')
      WHERE family_id = ?
    `);
    }
    static get updateSupportStmt() {
        return this.db.prepare(`
      UPDATE families 
      SET support_status = ?, assigned_sponsor_id = ?, updated_at = datetime('now')
      WHERE family_id = ?
    `);
    }
    static get updateProofDocsStmt() {
        return this.db.prepare(`
      UPDATE families 
      SET proof_documents = ?, updated_at = datetime('now')
      WHERE family_id = ?
    `);
    }
    static get deleteFamilyStmt() {
        return this.db.prepare(`DELETE FROM families WHERE family_id = ?`);
    }
    // ⭐ NEW STATEMENT FOR CHILD COUNT UPDATE
    static get updateChildrenCountStmt() {
        return this.db.prepare(`
      UPDATE families
      SET number_of_children = ?, updated_at = datetime('now')
      WHERE family_id = ?
    `);
    }
    // -------------------------------------------------------
    // CRUD METHODS
    // -------------------------------------------------------
    static create(data) {
        const family_id = `FAM${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-12);
        const proofJson = data.proof_documents ? JSON.stringify(data.proof_documents) : null;
        this.insertFamily.run(family_id, data.parent_id, data.income, data.address, proofJson);
        return this.getById(family_id);
    }
    static getById(family_id) {
        return this.getByIdStmt.get(family_id);
    }
    static getByParentId(parent_id) {
        return this.getByParentIdStmt.get(parent_id);
    }
    static getAll() {
        return this.getAllStmt.all();
    }
    // Helper method to get family by parent_id (alias for clarity)
    static getFamily(parent_id) {
        return this.getByParentId(parent_id) || null;
    }
    // Helper method to get all children for a family
    static getChildren(family_id) {
        return childprofile_1.ChildProfileModel.getByFamilyId(family_id);
    }
    static verifyFamily(family_id, status, volunteer_id) {
        this.updateVerificationStmt.run(status, volunteer_id || null, family_id);
    }
    static updateSupportStatus(family_id, status, sponsor_id) {
        if (status === 'sponsored' && !sponsor_id) {
            throw new Error('sponsor_id is required when status is "sponsored"');
        }
        this.updateSupportStmt.run(status, sponsor_id || null, family_id);
    }
    static uploadProofDocuments(family_id, documents) {
        this.updateProofDocsStmt.run(JSON.stringify(documents), family_id);
    }
    static delete(family_id) {
        const family = this.getById(family_id);
        if (family?.number_of_children && family.number_of_children > 0) {
            throw new Error('Cannot delete family with registered children');
        }
        this.deleteFamilyStmt.run(family_id);
    }
    // -------------------------------------------------------
    // ⭐ UPDATE CHILDREN COUNT
    // -------------------------------------------------------
    static updateChildrenCount(family_id, count) {
        const result = this.updateChildrenCountStmt.run(count, family_id);
        if (result.changes === 0) {
            throw new Error('Family not found for child count update.');
        }
    }
}
exports.FamilyModel = FamilyModel;
