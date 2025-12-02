CREATE TABLE admins (
    admin_id TEXT PRIMARY KEY,
    phone TEXT,
    FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE CASCADE
);
CREATE TABLE sponsor_shortlisted_families (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sponsor_id TEXT NOT NULL,
    family_id TEXT NOT NULL,
    shortlisted_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (sponsor_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (family_id) REFERENCES families(family_id) ON DELETE CASCADE,
    UNIQUE(sponsor_id, family_id)
);

CREATE TABLE awareness_contents (
    content_id TEXT PRIMARY KEY,
    admin_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT CHECK (type IN ('article', 'video', 'guide')),
    published_at TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE CASCADE
);
CREATE TABLE notifications (
    notification_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT,
    is_read INTEGER DEFAULT 0 CHECK (is_read IN (0, 1)),
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE TABLE progress_reports (
    report_id TEXT PRIMARY KEY,
    child_id TEXT NOT NULL,
    report_date TEXT NOT NULL,
    grades TEXT,
    attendance REAL CHECK (attendance >= 0 AND attendance <= 100),
    comments TEXT,
    document_url TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (child_id) REFERENCES child_profiles(child_id) ON DELETE CASCADE
);
CREATE TABLE verification_visits (
    visit_id TEXT PRIMARY KEY,
    volunteer_id TEXT NOT NULL,
    target_id TEXT NOT NULL, -- application_id or report_id
    target_type TEXT NOT NULL CHECK (target_type IN ('application', 'report')),
    visit_date TEXT,
    findings TEXT,
    status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'accepted', 'completed', 'cancelled')),
    assigned_at TEXT DEFAULT (datetime('now')),
    accepted_at TEXT,
    completed_at TEXT,
    FOREIGN KEY (volunteer_id) REFERENCES volunteers(volunteer_id) ON DELETE CASCADE
);
CREATE INDEX idx_visits_status ON verification_visits(status);
CREATE INDEX idx_visits_volunteer ON verification_visits(volunteer_id);
CREATE TABLE volunteers_new (
    volunteer_id TEXT PRIMARY KEY,
    phone TEXT,
    availability TEXT,
    area TEXT,
    status TEXT DEFAULT '' CHECK (status IN ('', 'pending', 'approved', 'rejected')),
    FOREIGN KEY (volunteer_id) REFERENCES users(user_id) ON DELETE CASCADE
);
CREATE TABLE users (
    user_id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('parent','sponsor','volunteer','admin')),
    status TEXT DEFAULT 'active' CHECK(status IN ('active','inactive','suspended')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    new_user_id TEXT
);
CREATE TABLE parents (
    parent_id TEXT PRIMARY KEY,
    phone TEXT,
    address TEXT,
    cnic TEXT,
    FOREIGN KEY (parent_id) REFERENCES users(user_id) ON DELETE CASCADE
);
CREATE TABLE volunteers (
    volunteer_id TEXT PRIMARY KEY,
    phone TEXT,
    availability TEXT,
    area TEXT,
    age INTEGER DEFAULT 18 CHECK(age >= 18), status TEXT DEFAULT 'pending' CHECK("status" IN ('requested', 'pending', 'approved', 'rejected')),
    FOREIGN KEY(volunteer_id) REFERENCES users(user_id) ON DELETE CASCADE
);
CREATE TABLE families (
    family_id TEXT PRIMARY KEY,
    parent_id TEXT NOT NULL,
    income REAL NOT NULL CHECK(income >= 0),
    address TEXT NOT NULL,
    number_of_children INTEGER DEFAULT 0,
    proof_documents TEXT,
    verification_status TEXT DEFAULT 'pending' CHECK(verification_status IN ('pending','verified','rejected')),
    support_status TEXT DEFAULT 'none' CHECK(support_status IN ('none','shortlisted','sponsored')),
    verified_by TEXT,
    assigned_sponsor_id TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(parent_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY(verified_by) REFERENCES volunteers(volunteer_id),
    FOREIGN KEY(assigned_sponsor_id) REFERENCES sponsors(sponsor_id)
);
CREATE TABLE child_profiles (
    child_id TEXT PRIMARY KEY,
    family_id TEXT NOT NULL,
    name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK(age >= 0 AND age <= 18),
    gender TEXT NOT NULL CHECK(gender IN ('male','female','other')),
    grade TEXT,
    school TEXT,
    photo_url TEXT,
    story TEXT,
    needs TEXT,
    orphan_status TEXT DEFAULT 'none' CHECK(orphan_status IN ('full_orphan','father_orphan','mother_orphan','none')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    bform_no TEXT,
    FOREIGN KEY(family_id) REFERENCES families(family_id) ON DELETE CASCADE
);
CREATE TABLE applications (
    application_id TEXT PRIMARY KEY,
    child_id TEXT NOT NULL,
    sponsor_id TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending','under_verification','verified','rejected','sponsored')),
    applied_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(child_id) REFERENCES child_profiles(child_id) ON DELETE CASCADE
);
CREATE TABLE fee_challans (
    challan_id TEXT PRIMARY KEY,
    application_id TEXT NOT NULL,
    child_id TEXT,
    amount REAL NOT NULL CHECK(amount > 0),
    challan_url TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending','paid','expired')),
    issued_at TEXT DEFAULT (datetime('now')),
    due_date TEXT DEFAULT (datetime('now','+15 days')),
    paid_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(application_id) REFERENCES applications(application_id) ON DELETE CASCADE,
    FOREIGN KEY(child_id) REFERENCES child_profiles(child_id) ON DELETE SET NULL
);
CREATE TABLE case_reporters (
    reporter_id TEXT PRIMARY KEY,
    user_id TEXT,
    phone TEXT,
    is_anonymous INTEGER DEFAULT 0 CHECK(is_anonymous IN (0,1)),
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE SET NULL
);
CREATE TABLE reports (
    report_id TEXT PRIMARY KEY,
    reporter_id TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    child_name TEXT,
    child_age INTEGER,
    photo_url TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending','under_verification','verified','action_taken','rejected')),
    reported_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')), assigned_volunteer_id TEXT DEFAULT NULL,
    FOREIGN KEY(reporter_id) REFERENCES case_reporters(reporter_id) ON DELETE CASCADE
);
CREATE TABLE sponsor_children (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sponsor_id TEXT NOT NULL,
    child_id TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(sponsor_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY(child_id) REFERENCES child_profiles(child_id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX idx_child_bform ON child_profiles(bform_no) WHERE bform_no IS NOT NULL;
CREATE INDEX idx_child_profiles_family ON child_profiles(family_id);
CREATE INDEX idx_families_support ON families(support_status);
CREATE INDEX idx_families_verification ON families(verification_status);
CREATE UNIQUE INDEX idx_parents_cnic ON parents(cnic) WHERE cnic IS NOT NULL;
CREATE INDEX idx_reports_reported_at ON reports(reported_at DESC);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE VIEW available_families AS
SELECT 
    f.family_id,
    f.parent_id,
    u.username AS parent_name,
    f.income,
    f.address,
    f.number_of_children,
    f.verification_status,
    f.support_status,
    f.assigned_sponsor_id
FROM families f
JOIN users u ON f.parent_id = u.user_id
WHERE f.support_status = 'none' AND f.verification_status = 'verified';
CREATE VIEW view_available_families AS
SELECT 
    f.family_id, f.address, f.income, f.number_of_children,
    u.username AS parent_name, u.email AS parent_email
FROM families f
JOIN users u ON f.parent_id = u.user_id
WHERE f.verification_status = 'verified' AND f.support_status = 'none';
CREATE TRIGGER trigger_child_count_decrement
AFTER DELETE ON child_profiles
FOR EACH ROW
BEGIN
    UPDATE families 
    SET number_of_children = number_of_children - 1,
        updated_at = datetime('now')
    WHERE family_id = OLD.family_id;
END;
CREATE TRIGGER trigger_child_count_increment
AFTER INSERT ON child_profiles
FOR EACH ROW
BEGIN
    UPDATE families 
    SET number_of_children = number_of_children + 1,
        updated_at = datetime('now')
    WHERE family_id = NEW.family_id;
END;
CREATE TABLE sponsors (
    sponsor_id TEXT PRIMARY KEY,
    phone TEXT UNIQUE,
    age INTEGER CHECK(age >= 18 AND age <= 100),
	occupation TEXT ,
    FOREIGN KEY(sponsor_id) REFERENCES users(user_id) ON DELETE CASCADE
);
