import { BaseModel } from "./BaseModels";
import { Volunteer } from "./volunteer";  

import { VolunteerModel } from "./volunteer";

export class AdminModel extends BaseModel {

    static initDB() {
        if (!this.db) this.init();
    }

    // Volunteer Management Functions

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
            // Automatically reject if age < 18
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

    // You can add more methods here for viewing profiles (use VolunteerModel.getById),
    // updating availability as admin if needed, etc.

    // Placeholder for other dashboard functionalities (to be added later)
    // e.g., methods for Parent Applications, Case Reports, Sponsorships, Awareness Content
}