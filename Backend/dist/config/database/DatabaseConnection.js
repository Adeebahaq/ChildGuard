"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseConnection = void 0;
// src/config/database/DatabaseConnection.ts
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DB_FILE = path_1.default.join(process.cwd(), "childguard.db");
// FIX: Explicitly set the path to the schema file relative to the project root (process.cwd())
// This ensures that ts-node-dev finds the file correctly inside the 'src' directory.
const SCHEMA_FILE = path_1.default.join(process.cwd(), "src", "config", "database", "schema.sql");
class DatabaseConnection {
    static instance = null;
    // synchronous getter for better-sqlite3
    static getInstance() {
        if (!this.instance) {
            const isNew = !fs_1.default.existsSync(DB_FILE);
            // open database (synchronous)
            this.instance = new better_sqlite3_1.default(DB_FILE);
            // enable foreign keys
            this.instance.pragma("foreign_keys = ON");
            // if new DB, run schema.sql synchronously
            if (isNew && fs_1.default.existsSync(SCHEMA_FILE)) {
                console.log(`[DB] Database created. Running schema from: ${SCHEMA_FILE}`); // Added a log to confirm
                const schema = fs_1.default.readFileSync(SCHEMA_FILE, "utf8");
                // execute whole schema (may contain multiple statements)
                this.instance.exec(schema);
                console.log("[DB] Schema executed successfully.");
            }
            else if (!fs_1.default.existsSync(SCHEMA_FILE)) {
                console.error(`[DB ERROR] Schema file not found at: ${SCHEMA_FILE}`);
            }
        }
        return this.instance;
    }
}
exports.DatabaseConnection = DatabaseConnection;
