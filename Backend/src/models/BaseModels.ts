// src/models/BaseModels.ts
import { DatabaseConnection } from "../config/database/DatabaseConnection";
import * as BetterSqlite3 from "better-sqlite3";

// This is your singleton DB
export class BaseModel {
    public static db: BetterSqlite3.Database;

    static init(): void {
        if (!this.db) {
            this.db = DatabaseConnection.getInstance();
            console.log("Database connected via BaseModel.init()");
        }
    }

    // Optional: Helper to run init early (recommended)
    static ensureInitialized() {
        this.init();
    }
}

// AUTO-INITIALIZE WHEN THIS FILE IS IMPORTED
BaseModel.init();   // This line is crucial!