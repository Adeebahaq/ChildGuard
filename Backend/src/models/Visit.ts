// src/models/Visit.ts
import { BaseModel } from "./BaseModels";

export interface VerificationVisit {
  visit_id: string;
  volunteer_id: string; 
  target_id: string;
  target_type: "application" | "report";
  visit_date?: string;
  findings?: string;
  status: "assigned" | "accepted" | "completed" | "cancelled";
  assigned_at?: string;
  accepted_at?: string;
  completed_at?: string;
}

export class VisitModel extends BaseModel {

  static async getAllByVolunteer(volunteer_id: string): Promise<VerificationVisit[]> {
    this.init();
    const rows = this.db
      .prepare(`SELECT * FROM verification_visits WHERE volunteer_id = ? ORDER BY visit_date ASC`)
      .all(volunteer_id);
    return rows as VerificationVisit[];
  }

 
  static async getById(visit_id: string): Promise<VerificationVisit | null> {
    this.init();
    const row = this.db
      .prepare(`SELECT * FROM verification_visits WHERE visit_id = ?`)
      .get(visit_id) as VerificationVisit | undefined;
    return row ?? null;
  }

  
  static async acceptVisit(visit_id: string): Promise<VerificationVisit | null> {
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

  
  static async completeVisit(visit_id: string, findings?: string): Promise<VerificationVisit | null> {
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

  
  static async createVisit(data: {
    volunteer_id: string; 
    target_id: string;
    target_type: "application" | "report";
    visit_date?: string;
  }): Promise<VerificationVisit | null> {
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
