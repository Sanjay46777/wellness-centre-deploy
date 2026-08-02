-- Wellness Centre Feedback Platform — PostgreSQL Schema

-- Users: students, head counsellors, and admins
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'head_counsellor', 'admin')),
  student_id VARCHAR(100) DEFAULT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_users_email UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users (status);

-- Counsellors / Psychologists
CREATE TABLE IF NOT EXISTS counsellors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  designation VARCHAR(255) DEFAULT NULL,
  team VARCHAR(100) DEFAULT NULL,
  specialization VARCHAR(255) DEFAULT NULL,
  email VARCHAR(255) DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_counsellors_active ON counsellors (is_active);
CREATE INDEX IF NOT EXISTS idx_counsellors_designation ON counsellors (designation);
CREATE INDEX IF NOT EXISTS idx_counsellors_team ON counsellors (team);

-- Feedback submissions
CREATE TABLE IF NOT EXISTS feedback (
  id SERIAL PRIMARY KEY,
  counsellor_id INTEGER NOT NULL,
  user_id INTEGER DEFAULT NULL,
  q1_comfort INTEGER CHECK (q1_comfort BETWEEN 1 AND 5),
  q2_understood INTEGER CHECK (q2_understood BETWEEN 1 AND 5),
  q3_time INTEGER CHECK (q3_time BETWEEN 1 AND 5),
  q4_quality INTEGER CHECK (q4_quality BETWEEN 1 AND 5),
  q5_respected INTEGER CHECK (q5_respected BETWEEN 1 AND 5),
  q6_supported INTEGER CHECK (q6_supported BETWEEN 1 AND 5),
  q7_hopeful INTEGER CHECK (q7_hopeful BETWEEN 1 AND 5),
  q8_safe INTEGER CHECK (q8_safe BETWEEN 1 AND 5),
  q9_communication INTEGER CHECK (q9_communication BETWEEN 1 AND 5),
  q10_overall INTEGER CHECK (q10_overall BETWEEN 1 AND 5),
  recommendation VARCHAR(5) CHECK (recommendation IN ('Yes', 'No', 'Maybe')),
  comments TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  respondent_email VARCHAR(255) DEFAULT NULL,
  submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_feedback_counsellor FOREIGN KEY (counsellor_id) REFERENCES counsellors(id) ON DELETE CASCADE,
  CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_feedback_counsellor_id ON feedback (counsellor_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback (user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_submitted_at ON feedback (submitted_at);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_prt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_prt_token ON password_reset_tokens (token);
CREATE INDEX IF NOT EXISTS idx_prt_user_id ON password_reset_tokens (user_id);
