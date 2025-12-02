"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwarenessContentModel = void 0;
// src/models/AwarenessContent.ts
const BaseModels_1 = require("./BaseModels");
const uuid_1 = require("uuid");
class AwarenessContentModel extends BaseModels_1.BaseModel {
    // Create new awareness content (admin only)
    static async create(data) {
        this.init();
        const content_id = 'CNT' + (0, uuid_1.v4)().replace(/-/g, '').substring(0, 12).toUpperCase();
        const now = new Date().toISOString();
        const status = data.status || 'published';
        this.db.prepare(`
      INSERT INTO awareness_contents 
      (content_id, admin_id, title, content, type, status, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(content_id, data.admin_id, data.title.trim(), data.content.trim(), data.type, status, status === 'published' ? now : null);
        return {
            content_id,
            admin_id: data.admin_id,
            title: data.title.trim(),
            content: data.content.trim(),
            type: data.type,
            status,
            published_at: status === 'published' ? now : null,
            created_at: now,
        };
    }
    // Get all content including drafts (for admin panel)
    static async getAll() {
        this.init();
        return this.db.prepare(`
      SELECT ac.*, u.username AS admin_name
      FROM awareness_contents ac
      JOIN users u ON ac.admin_id = u.user_id
      ORDER BY ac.published_at DESC NULLS LAST, ac.content_id DESC
    `).all();
    }
    // Get only published content (for public / mobile app)
    static async getPublished() {
        this.init();
        return this.db.prepare(`
      SELECT * FROM awareness_contents
      WHERE status = 'published'
      ORDER BY published_at DESC
    `).all();
    }
    // Update existing content
    static async update(content_id, updates) {
        this.init();
        const fields = [];
        const values = [];
        if (updates.title !== undefined) {
            fields.push('title = ?');
            values.push(updates.title.trim());
        }
        if (updates.content !== undefined) {
            fields.push('content = ?');
            values.push(updates.content.trim());
        }
        if (updates.type !== undefined) {
            fields.push('type = ?');
            values.push(updates.type);
        }
        if (updates.status !== undefined) {
            fields.push('status = ?');
            values.push(updates.status);
            fields.push('published_at = ?');
            values.push(updates.status === 'published' ? new Date().toISOString() : null);
        }
        if (fields.length === 0)
            throw new Error('No fields to update');
        values.push(content_id);
        this.db.prepare(`
      UPDATE awareness_contents SET ${fields.join(', ')} WHERE content_id = ?
    `).run(...values);
        const updated = this.db.prepare('SELECT * FROM awareness_contents WHERE content_id = ?')
            .get(content_id);
        if (!updated)
            throw new Error('Content not found after update');
        return updated;
    }
    // Delete content by ID
    static async delete(content_id) {
        this.init();
        const result = this.db.prepare('DELETE FROM awareness_contents WHERE content_id = ?')
            .run(content_id);
        return result.changes > 0;
    }
    // Get single content by ID (optional helper)
    static async getById(content_id) {
        this.init();
        const row = this.db.prepare('SELECT * FROM awareness_contents WHERE content_id = ?')
            .get(content_id);
        return row ?? null;
    }
}
exports.AwarenessContentModel = AwarenessContentModel;
