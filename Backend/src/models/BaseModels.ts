// src/models/BaseModels.ts

import { DatabaseConnection } from "../config/database/DatabaseConnection";

import * as BetterSqlite3 from "better-sqlite3"; 

export class BaseModel {
    
    public static db: BetterSqlite3.Database;

    
    static init(): void {
        if (!this.db) {
            this.db = DatabaseConnection.getInstance();
        }
    }
}