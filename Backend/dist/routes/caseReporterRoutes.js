"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const caseReporter_1 = require("../models/caseReporter");
const router = (0, express_1.Router)();
// ================= MULTER STORAGE =====================
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path_1.default.join(__dirname, "../../public/uploads"));
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, unique + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({ storage });
// ================= ROUTE =====================
router.post("/report", upload.single("photo"), (req, res) => {
    try {
        const body = req.body;
        const report = caseReporter_1.CaseReporterModel.reportCase({
            ...body,
            child_age: body.child_age ? parseInt(body.child_age, 10) : null,
            is_anonymous: body.is_anonymous ? 1 : 0,
            photo_url: req.file ? `/uploads/${req.file.filename}` : null,
        });
        res.status(201).json({ success: true, report });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            error: err.message,
        });
    }
});
exports.default = router;
