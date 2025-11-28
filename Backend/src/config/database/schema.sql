-- backend/src/config/database/schema.sql
-- ChildGuard — FULL PRODUCTION DATABASE SCHEMA (SQLite)
-- Includes: CaseReporter, FeeChallan, ChildProfile, Family, Auth, Notifications, Triggers, Views
-- Run this ONCE — it will create everything safely

PRAGMA foreign_keys = ON;

-- ============================================
-- USERS & AUTH
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('parent', 'sponsor', 'volunteer', 'admin')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- ROLE-SPECIFIC TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS parents (
    parent_id TEXT PRIMARY KEY,
    phone TEXT,
    address TEXT,
    FOREIGN KEY (parent_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sponsors (
    sponsor_id TEXT PRIMARY KEY,
    phone TEXT,
    preferences TEXT, -- JSON
    FOREIGN KEY (sponsor_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS volunteers (
    volunteer_id TEXT PRIMARY KEY,
    phone TEXT,
    availability TEXT,
    area TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','requested' 'approved', 'rejected')),
    FOREIGN KEY (volunteer_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================
-- CASE REPORTER SYSTEM (CHILD LABOR REPORTS)
-- ============================================

CREATE TABLE IF NOT EXISTS case_reporters (
    reporter_id TEXT PRIMARY KEY,
    user_id TEXT, -- NULL if anonymous
    phone TEXT,
    is_anonymous INTEGER DEFAULT 0 CHECK(is_anonymous IN (0, 1)),
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS reports (
    report_id TEXT PRIMARY KEY,
    reporter_id TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    child_name TEXT,
    child_age INTEGER,
    photo_url TEXT,
    status TEXT DEFAULT 'pending' 
        CHECK(status IN ('pending', 'under_verification', 'verified', 'action_taken', 'rejected')),
    reported_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (reporter_id) REFERENCES case_reporters(reporter_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_reported_at ON reports(reported_at DESC);

-- ============================================
-- FAMILY & CHILD PROFILES
-- ============================================

CREATE TABLE IF NOT EXISTS families (
    family_id TEXT PRIMARY KEY,
    parent_id TEXT NOT NULL,
    income REAL NOT NULL CHECK (income >= 0),
    address TEXT NOT NULL,
    number_of_children INTEGER DEFAULT 0,
    proof_documents TEXT, -- JSON array
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    support_status TEXT DEFAULT 'none' CHECK (support_status IN ('none', 'shortlisted', 'sponsored')),
    verified_by TEXT,
    assigned_sponsor_id TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (parent_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES volunteers(volunteer_id),
    FOREIGN KEY (assigned_sponsor_id) REFERENCES sponsors(sponsor_id)
);

CREATE INDEX IF NOT EXISTS idx_families_verification ON families(verification_status);
CREATE INDEX IF NOT EXISTS idx_families_support ON families(support_status);

CREATE TABLE IF NOT EXISTS child_profiles (
    child_id TEXT PRIMARY KEY,
    family_id TEXT NOT NULL,
    name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 0 AND age <= 18),
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
    grade TEXT,
    school TEXT,
    photo_url TEXT,
    story TEXT,
    needs TEXT, -- JSON
    orphan_status TEXT DEFAULT 'none' 
        CHECK (orphan_status IN ('full_orphan', 'father_orphan', 'mother_orphan', 'none')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (family_id) REFERENCES families(family_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_child_profiles_family ON child_profiles(family_id);

-- ============================================
-- FEE CHALLAN SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS applications (
    application_id TEXT PRIMARY KEY,
    child_id TEXT NOT NULL,
    sponsor_id TEXT,
    status TEXT DEFAULT 'pending' 
        CHECK (status IN ('pending', 'under_verification', 'verified', 'rejected', 'sponsored')),
    applied_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (child_id) REFERENCES child_profiles(child_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fee_challans (
    challan_id TEXT PRIMARY KEY,
    application_id TEXT NOT NULL,
    child_id TEXT,
    amount REAL NOT NULL CHECK (amount > 0),
    challan_url TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'expired')),
    issued_at TEXT DEFAULT (datetime('now')),
    due_date TEXT DEFAULT (datetime('now', '+15 days')),
    paid_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (application_id) REFERENCES applications(application_id) ON DELETE CASCADE,
    FOREIGN KEY (child_id) REFERENCES child_profiles(child_id) ON DELETE SET NULL
);

-- ============================================
-- AUTO UPDATE CHILD COUNT IN FAMILY
-- ============================================

CREATE TRIGGER IF NOT EXISTS trigger_child_count_increment
AFTER INSERT ON child_profiles
FOR EACH ROW
BEGIN
    UPDATE families 
    SET number_of_children = number_of_children + 1,
        updated_at = datetime('now')
    WHERE family_id = NEW.family_id;
END;

CREATE TRIGGER IF NOT EXISTS trigger_child_count_decrement
AFTER DELETE ON child_profiles
FOR EACH ROW
BEGIN
    UPDATE families 
    SET number_of_children = number_of_children - 1,
        updated_at = datetime('now')
    WHERE family_id = OLD.family_id;
END;

-- ============================================
-- VIEWS
-- ============================================

CREATE VIEW IF NOT EXISTS view_available_families AS
SELECT 
    f.family_id, f.address, f.income, f.number_of_children,
    u.username AS parent_name, u.email AS parent_email
FROM families f
JOIN users u ON f.parent_id = u.user_id
WHERE f.verification_status = 'verified' AND f.support_status = 'none';

-- ============================================
-- TEST DATA (Safe to run multiple times)
-- ============================================

-- Admin
INSERT OR IGNORE INTO users (user_id, username, email, password_hash, role) VALUES
('USR001', 'admin', 'admin@childguard.org', '$2b$10$examplehashforadmin123', 'admin');

-- Parent
INSERT OR IGNORE INTO users (user_id, username, email, password_hash, role) VALUES
('USR002', 'ali_khan', 'ali@example.com', '$2b$10$examplehashfortest123', 'parent');
INSERT OR IGNORE INTO parents (parent_id, phone, address) VALUES
('USR002', '03001234567', 'Lahore, Pakistan');

-- Family
INSERT OR IGNORE INTO families (family_id, parent_id, income, address, verification_status) VALUES
('FAM001', 'USR002', 18000, 'House 123, Lahore', 'verified');

-- Child
INSERT OR IGNORE INTO child_profiles (child_id, family_id, name, age, gender) VALUES
('CHD001', 'FAM001', 'Ayesha', 8, 'female');

-- Anonymous Reporter + Report
INSERT OR IGNORE INTO case_reporters (reporter_id, user_id, phone, is_anonymous) VALUES
('REP999', NULL, '03009998888', 1);

INSERT OR IGNORE INTO reports (report_id, reporter_id, location, description, status) VALUES
('RPT999', 'REP999', 'Factory Area, Lahore', 'Child seen working late hours', 'pending');

-- Done!