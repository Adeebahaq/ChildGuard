"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChildProfileModel = void 0;
// src/models/ChildProfile.ts
const BaseModels_1 = require("./BaseModels");
const family_1 = require("./family");
// === CRITICAL: Initialize DB connection ===
BaseModels_1.BaseModel.init();
class ChildProfileModel extends BaseModels_1.BaseModel {
    // === SAFE PREPARED STATEMENTS (Updated to include bform_no and class) ===
    static get insertStmt() {
        return this.db.prepare(`
      INSERT INTO child_profiles 
      (child_id, family_id, name, age, gender, grade, school, photo_url, story, needs, orphan_status, created_at, updated_at, bform_no, class)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), ?, ?)
    `);
    }
    static get getByIdStmt() {
        return this.db.prepare('SELECT * FROM child_profiles WHERE child_id = ?');
    }
    static get getByFamilyIdStmt() {
        return this.db.prepare('SELECT * FROM child_profiles WHERE family_id = ? ORDER BY created_at DESC');
    }
    static get updateStmt() {
        return this.db.prepare(`
      UPDATE child_profiles 
      SET name = ?, age = ?, gender = ?, grade = ?, school = ?, story = ?, needs = ?, orphan_status = ?, bform_no = ?, class = ?, updated_at = datetime('now')
      WHERE child_id = ?
    `);
    }
    static get updatePhotoStmt() {
        return this.db.prepare('UPDATE child_profiles SET photo_url = ?, updated_at = datetime("now") WHERE child_id = ?');
    }
    static get deleteStmt() {
        return this.db.prepare('DELETE FROM child_profiles WHERE child_id = ?');
    }
    // === CREATE CHILD (Updated: bform_no and class are no longer optional) ===
    static create(data) {
        // Validation for new required fields
        if (!data.bform_no || data.bform_no.trim() === '') {
            throw new Error('B-Form Number is required.');
        }
        if (!data.class || data.class.trim() === '') {
            throw new Error('Class/Grade is required.');
        }
        // Validate age
        if (data.age < 0 || data.age > 18) {
            throw new Error('Child age must be between 0 and 18');
        }
        // Validate family exists
        const family = family_1.FamilyModel.getById(data.family_id);
        if (!family) {
            throw new Error('Family not found');
        }
        const child_id = `CHD${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-12);
        const needsJson = data.needs ? JSON.stringify(data.needs) : null;
        // Insert child
        this.insertStmt.run(child_id, data.family_id, data.name, data.age, data.gender, data.grade || null, data.school || null, null, // photo_url
        data.story || null, needsJson, data.orphan_status || 'none', data.bform_no, // Required
        data.class // Required
        );
        return this.getById(child_id);
    }
    // === GET ONE ===
    static getById(child_id) {
        return this.getByIdStmt.get(child_id);
    }
    // === GET ALL BY FAMILY ===
    static getByFamilyId(family_id) {
        return this.getByFamilyIdStmt.all(family_id);
    }
    // === UPDATE CHILD INFO (bform_no and class are still optional in update) ===
    static update(child_id, data) {
        const child = this.getById(child_id);
        if (!child)
            throw new Error('Child not found');
        // Validate age if provided
        if (data.age !== undefined && (data.age < 0 || data.age > 18)) {
            throw new Error('Child age must be between 0 and 18');
        }
        const needsJson = data.needs ? JSON.stringify(data.needs) : child.needs;
        this.updateStmt.run(data.name ?? child.name, data.age ?? child.age, data.gender ?? child.gender, data.grade ?? child.grade, data.school ?? child.school, data.story ?? child.story, needsJson, data.orphan_status ?? child.orphan_status, data.bform_no ?? child.bform_no, data.class ?? child.class, child_id);
        return this.getById(child_id);
    }
    // === UPDATE PHOTO ===
    static updatePhoto(child_id, photo_url) {
        const result = this.updatePhotoStmt.run(photo_url, child_id);
        if (result.changes === 0)
            throw new Error('Child not found');
    }
    // === DELETE CHILD ===
    static delete(child_id) {
        const child = this.getById(child_id);
        if (!child) {
            throw new Error('Child not found');
        }
        // Delete child (database trigger will auto-decrement family child count)
        this.deleteStmt.run(child_id);
    }
}
exports.ChildProfileModel = ChildProfileModel;
