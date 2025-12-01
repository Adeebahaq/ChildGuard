// src/models/FeeChallan.ts
import { BaseModel } from './BaseModels';

// Initialize DB connection (critical!)
BaseModel.init();

export interface FeeChallan {
  challan_id: string;
  application_id: string;     // links to sponsorship application
  child_id: string;           // required: which child this is for
  amount: number;
  challan_url: string;
  status: 'pending' | 'paid' | 'expired';
  issued_at: string;
  due_date: string;
  paid_at?: string | null;
  created_at: string;
  updated_at: string;
}

export class FeeChallanModel extends BaseModel {
  // === SAFE PREPARED STATEMENTS ===
  private static get insertStmt() {
    return this.db.prepare(`
      INSERT INTO fee_challans 
      (challan_id, application_id, child_id, amount, challan_url, status, issued_at, due_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'pending', datetime('now'), datetime('now', '+15 days'), datetime('now'), datetime('now'))
    `);
  }

  private static get getByIdStmt() {
    return this.db.prepare('SELECT * FROM fee_challans WHERE challan_id = ?');
  }

  private static get getByApplicationStmt() {
    return this.db.prepare('SELECT * FROM fee_challans WHERE application_id = ? ORDER BY created_at DESC');
  }

  private static get getByChildIdStmt() {
    return this.db.prepare('SELECT * FROM fee_challans WHERE child_id = ? ORDER BY created_at DESC');
  }

  private static get markAsPaidStmt() {
    return this.db.prepare(`
      UPDATE fee_challans 
      SET status = 'paid', paid_at = datetime('now'), updated_at = datetime('now')
      WHERE challan_id = ?
    `);
  }

  private static get expireOldStmt() {
    return this.db.prepare(`
      UPDATE fee_challans 
      SET status = 'expired' 
      WHERE status = 'pending' AND due_date < datetime('now')
    `);
  }

  // === CREATE CHALLAN ===
  static create(data: {
    application_id: string;
    child_id: string;          // NOW REQUIRED
    amount: number;
    challan_url: string;
  }): FeeChallan {
    const challan_id = `CHL${Date.now()}${Math.floor(Math.random() * 999)}`.slice(-12);

    this.insertStmt.run(
      challan_id,
      data.application_id,
      data.child_id,             // No more || null
      data.amount,
      data.challan_url
    );

    return this.getById(challan_id)!;
  }

  // === GET ONE ===
  static getById(challan_id: string): FeeChallan | undefined {
    return this.getByIdStmt.get(challan_id) as FeeChallan | undefined;
  }

  static getByApplication(application_id: string): FeeChallan[] {
    return this.getByApplicationStmt.all(application_id) as FeeChallan[];
  }

  // === GET BY CHILD ID ===
  static getByChildId(child_id: string): FeeChallan[] {
    return this.getByChildIdStmt.all(child_id) as FeeChallan[];
  }

  // === MARK AS PAID ===
  static markAsPaid(challan_id: string): void {
    const result = this.markAsPaidStmt.run(challan_id);
    if (result.changes === 0) throw new Error('Challan not found or already paid');
  }

  // === EXPIRE OLD CHALLANS (run daily via cron or endpoint) ===
  static expireOldChallans(): number {
    const result = this.expireOldStmt.run();
    return result.changes;
  }
}