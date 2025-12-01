// src/models/Family.ts
import { BaseModel } from './BaseModels';
import { ChildProfileModel } from './childprofile';

// === ENSURE DB IS INITIALIZED ===
BaseModel.init(); // ← MUST BE FIRST

export interface Family {
  family_id: string;
  parent_id: string;
  income: number;
  address: string;
  number_of_children: number;
  proof_documents?: string | null;
  verification_status: 'pending' | 'verified' | 'rejected';
  support_status: 'none' | 'shortlisted' | 'sponsored';
  enrollment_date?: string | null;
  verified_by?: string | null;
  assigned_sponsor_id?: string | null;
  created_at: string;
  updated_at: string;
  parent_name?: string;
  parent_email?: string;
}

export class FamilyModel extends BaseModel {
  // ---------------------------------------------
  // STATIC PREPARED STATEMENTS
  // ---------------------------------------------
  private static get insertFamily() {
    return this.db.prepare(`
      INSERT INTO families (
        family_id, parent_id, income, address, proof_documents,
        number_of_children, verification_status, support_status
      ) 
      VALUES (?, ?, ?, ?, ?, 0, 'pending', 'none')
    `);
  }

  private static get getByIdStmt() {
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

  private static get getByParentIdStmt() {
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

  private static get getAllStmt() {
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

  private static get updateVerificationStmt() {
    return this.db.prepare(`
      UPDATE families 
      SET verification_status = ?, verified_by = ?, updated_at = datetime('now')
      WHERE family_id = ?
    `);
  }

  private static get updateSupportStmt() {
    return this.db.prepare(`
      UPDATE families 
      SET support_status = ?, assigned_sponsor_id = ?, updated_at = datetime('now')
      WHERE family_id = ?
    `);
  }

  private static get updateProofDocsStmt() {
    return this.db.prepare(`
      UPDATE families 
      SET proof_documents = ?, updated_at = datetime('now')
      WHERE family_id = ?
    `);
  }

  private static get deleteFamilyStmt() {
    return this.db.prepare(`DELETE FROM families WHERE family_id = ?`);
  }

  // ⭐ NEW STATEMENT FOR CHILD COUNT UPDATE
  private static get updateChildrenCountStmt() {
    return this.db.prepare(`
      UPDATE families
      SET number_of_children = ?, updated_at = datetime('now')
      WHERE family_id = ?
    `);
  }

  // -------------------------------------------------------
  // CRUD METHODS
  // -------------------------------------------------------
  static create(data: {
    parent_id: string;
    income: number;
    address: string;
    proof_documents?: string[];
  }): Family {
    const family_id = `FAM${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-12);
    const proofJson = data.proof_documents ? JSON.stringify(data.proof_documents) : null;

    this.insertFamily.run(
      family_id,
      data.parent_id,
      data.income,
      data.address,
      proofJson
    );

    return this.getById(family_id)!;
  }

  static getById(family_id: string): Family | undefined {
    return this.getByIdStmt.get(family_id) as Family | undefined;
  }

  static getByParentId(parent_id: string): Family | undefined {
    return this.getByParentIdStmt.get(parent_id) as Family | undefined;
  }

  static getAll(): Family[] {
    return this.getAllStmt.all() as Family[];
  }

  // Helper method to get family by parent_id (alias for clarity)
  static getFamily(parent_id: string): Family | null {
    return this.getByParentId(parent_id) || null;
  }

  // Helper method to get all children for a family
  static getChildren(family_id: string) {
    return ChildProfileModel.getByFamilyId(family_id);
  }

  static verifyFamily(
    family_id: string,
    status: 'verified' | 'rejected',
    volunteer_id?: string
  ): void {
    this.updateVerificationStmt.run(status, volunteer_id || null, family_id);
  }

  static updateSupportStatus(
    family_id: string,
    status: 'shortlisted' | 'sponsored',
    sponsor_id?: string
  ): void {
    if (status === 'sponsored' && !sponsor_id) {
      throw new Error('sponsor_id is required when status is "sponsored"');
    }
    this.updateSupportStmt.run(status, sponsor_id || null, family_id);
  }

  static uploadProofDocuments(family_id: string, documents: string[]): void {
    this.updateProofDocsStmt.run(JSON.stringify(documents), family_id);
  }

  static delete(family_id: string): void {
    const family = this.getById(family_id);
    if (family?.number_of_children && family.number_of_children > 0) {
      throw new Error('Cannot delete family with registered children');
    }
    this.deleteFamilyStmt.run(family_id);
  }

  // -------------------------------------------------------
  // ⭐ UPDATE CHILDREN COUNT
  // -------------------------------------------------------
  static updateChildrenCount(family_id: string, count: number): void {
    const result = this.updateChildrenCountStmt.run(count, family_id);
    if (result.changes === 0) {
      throw new Error('Family not found for child count update.');
    }
  }
}