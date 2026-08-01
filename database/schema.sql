-- Wellness Centre Feedback Platform — MySQL Schema

CREATE DATABASE IF NOT EXISTS wellness_centre
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE wellness_centre;

-- Users: students, head counsellors, and admins
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role ENUM('student', 'head_counsellor', 'admin') NOT NULL,
  student_id VARCHAR(100) DEFAULT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Counsellors / Psychologists
CREATE TABLE counsellors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  designation VARCHAR(255) DEFAULT NULL,
  team VARCHAR(100) DEFAULT NULL,
  specialization VARCHAR(255) DEFAULT NULL,
  email VARCHAR(255) DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_active (is_active),
  INDEX idx_designation (designation),
  INDEX idx_team (team)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Feedback submissions
CREATE TABLE feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  counsellor_id INT NOT NULL,
  user_id INT DEFAULT NULL,
  q1_comfort INT CHECK (q1_comfort BETWEEN 1 AND 5),
  q2_understood INT CHECK (q2_understood BETWEEN 1 AND 5),
  q3_time INT CHECK (q3_time BETWEEN 1 AND 5),
  q4_quality INT CHECK (q4_quality BETWEEN 1 AND 5),
  q5_respected INT CHECK (q5_respected BETWEEN 1 AND 5),
  q6_supported INT CHECK (q6_supported BETWEEN 1 AND 5),
  q7_hopeful INT CHECK (q7_hopeful BETWEEN 1 AND 5),
  q8_safe INT CHECK (q8_safe BETWEEN 1 AND 5),
  q9_communication INT CHECK (q9_communication BETWEEN 1 AND 5),
  q10_overall INT CHECK (q10_overall BETWEEN 1 AND 5),
  recommendation ENUM('Yes', 'No', 'Maybe'),
  comments TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  respondent_email VARCHAR(255) DEFAULT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (counsellor_id) REFERENCES counsellors(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_counsellor_id (counsellor_id),
  INDEX idx_user_id (user_id),
  INDEX idx_submitted_at (submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Password reset tokens
CREATE TABLE password_reset_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
