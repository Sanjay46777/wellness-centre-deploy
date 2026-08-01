-- Seed data for Wellness Centre

USE wellness_centre;

-- Demo accounts (passwords match the README)
INSERT INTO users (email, password_hash, full_name, role, phone, student_id, status, email_verified)
VALUES
  ('wellness1@smail.iitm.ac.in', '$2b$10$e7w../1t3EnrOSWXlH45FeLhvSkJuxYeuZBTRyk7ZHLwV.1T3cPaq', 'Saranraj R', 'admin', '9876543210', NULL, 'approved', true),
  ('wo@smail.iitm.ac.in', '$2b$10$JxGFvAwVUlMT26pK48Ipjeo44lrB8zcom1cu8ZOvszTS7.Apd7Nae', 'Colonel R Balaji', 'head_counsellor', '9876543210', NULL, 'approved', true),
  ('student-demo@wellness.local', '$2b$10$OziR6TguyqEO1Szazfx2zu4uwQTz5LxDgcn7x6QbL4cU18dYJ.aeu', 'Demo Student', 'student', '9876543211', 'CS21S001', 'approved', true);

-- Counselling team
INSERT INTO counsellors (name, designation, team, specialization, email, is_active)
VALUES
  ('Ms. Raksha', 'Counsellor', 'Team B', 'Wellness', 'wellnesswc1@smail.iitm.ac.in', true),
  ('Logeshwaran T', 'Counsellor', 'Team B', 'Wellness', 'wellnesswc2@smail.iitm.ac.in', true),
  ('Geetanjali', 'Counsellor', 'Team B', 'Wellness', 'wellnesswc3@smail.iitm.ac.in', true),
  ('Akshaya', 'Counsellor', 'Team B', 'Wellness', 'wellnesswc4@smail.iitm.ac.in', true),
  ('Blessing Calvin', 'Counsellor', 'Team B', 'Wellness', 'wellnesswc5@smail.iitm.ac.in', true),
  ('Durga Devi S', 'Counsellor', 'Team A', 'Wellness', 'wellnesswc6@smail.iitm.ac.in', true),
  ('Karthick R', 'Counsellor', 'Team A', 'Wellness', 'wellnessc1@smail.iitm.ac.in', true),
  ('Govardhan S', 'Counsellor', 'Team A', 'Wellness', 'wellnessc2@smail.iitm.ac.in', true),
  ('Nirmalraj B', 'Counsellor', 'Team A', 'Wellness', 'wellnessc3@smail.iitm.ac.in', true),
  ('Srinivasan E', 'Counsellor', 'Team A', 'Wellness', 'wellnessc4@smail.iitm.ac.in', true),
  ('Aaarathy', 'Counsellor', 'Team A', 'Wellness', 'wellnessc5@smail.iitm.ac.in', true),
  ('Revathy', 'Counsellor', 'Team A', 'Wellness', 'wellnessc6@smail.iitm.ac.in', true);

-- NOTE: No demo feedback is seeded. Real feedback will be collected through the app.
