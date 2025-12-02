"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseModel = void 0;
// src/models/BaseModels.ts
const DatabaseConnection_1 = require("../config/database/DatabaseConnection");
// This is your singleton DB
class BaseModel {
    static db;
    static init() {
        if (!this.db) {
            this.db = DatabaseConnection_1.DatabaseConnection.getInstance();
            console.log("Database connected via BaseModel.init()");
        }
    }
    // Optional: Helper to run init early
    static ensureInitialized() {
        this.init();
    }
}
exports.BaseModel = BaseModel;
// AUTO-INITIALIZE WHEN THIS FILE IS IMPORTED
BaseModel.init(); // This line is crucial!
