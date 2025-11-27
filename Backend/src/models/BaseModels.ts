// src/models/BaseModels.ts
import { DatabaseConnection } from "../config/database/DatabaseConnection";
import * as BetterSqlite3 from "better-sqlite3";

// This is your singleton DB
export class BaseModel {

    public static db: BetterSqlite3.Database;

    // Runs automatically when any model is first used
    static init(): void {
        if (!this.db) {
            this.db = DatabaseConnection.getInstance();
            console.log("Database connected via BaseModel.init()");
        }
    }

    // Optional: Helper to run init early
    static ensureInitialized() {
        this.init();
    }
}

// AUTO-INITIALIZE WHEN THIS FILE IS IMPORTED
BaseModel.init();   // ← REQUIRED LINE
