import { BaseModel } from "./BaseModels";

export interface Volunteer {
    volunteer_id: string; 
    phone: string | null;
    availability: string | null; 
    area: string | null;
    age: number | null;                   // <-- added age
    status: "pending" | "requested" | "approved" | "rejected";
}

export class VolunteerModel extends BaseModel {
   
    static initDB() {
        if (!this.db) this.init();
    }

    
    static async getById(volunteerId: string): Promise<Volunteer | null> {
        this.initDB();
        const row = this.db
            .prepare(
                "SELECT volunteer_id, phone, availability, area, age, status FROM volunteers WHERE volunteer_id = ?"
            )
            .get(volunteerId) as Volunteer | undefined;

        return row ?? null;
    }

    
    static async getByUserId(userId: string): Promise<Volunteer | null> {
        return this.getById(userId);
    }

   
    static async create(volunteerId: string): Promise<Volunteer> {
        this.initDB();
        this.db
            .prepare(
                `INSERT INTO volunteers (volunteer_id, phone, availability, area, age, status)
                 VALUES (?, NULL, NULL, NULL, 18, 'pending')`    // <-- default age 18
            )
            .run(volunteerId);

        return this.getById(volunteerId) as Promise<Volunteer>;
    }

   
    static async updateAvailability(
        volunteerId: string,
        availability: { days: string[]; time: string }
    ): Promise<Volunteer | null> {
        this.initDB();

        const result = this.db
            .prepare(`
                UPDATE volunteers 
                SET availability = ? 
                WHERE volunteer_id = ?
            `)
            .run(JSON.stringify(availability), volunteerId);

        if (result.changes === 0) return null;

        return this.getById(volunteerId);
    }

 
    static async requestApproval(
        volunteerId: string,
        data: {
            phone: string;
            area: string;
            age: number;                         // <-- added age
            availability: { days: string[]; time: string };
        }
    ): Promise<Volunteer | null> {
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
            .run(
                data.phone,
                data.area,
                data.age,
                JSON.stringify(data.availability),
                volunteerId
            );

        if (result.changes === 0) return null;

        return this.getById(volunteerId);
    }
}
