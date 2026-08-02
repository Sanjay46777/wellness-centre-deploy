# Requirements Document

## 1. Application Overview

**Application Name**: Wellness Centre Feedback Platform (Web Rebuild)

**Description**: A professional, responsive, scalable web application for IIT Madras Wellness Centre to collect anonymous/non-anonymous feedback about counsellors, provide role-based dashboards for Students, Head Counsellors, and Admins, and enable institution-wide analytics with data export capabilities.

**Platform**: Web Application (Desktop, Tablet, Mobile)

**Language**: English

**Technology Stack**:
- Frontend: React + TypeScript + Vite
- Styling: Tailwind CSS
- Components: shadcn/ui
- Icons: Lucide React
- Animations: Framer Motion
- Charts: Recharts
- Backend: Node.js + Express
- Database: MySQL
- Authentication: JWT
- API: RESTful API
- State Management: Zustand
- Form Validation: React Hook Form + Zod

---

## 2. User Personas and Usage Scenarios

### 2.1 User Personas

**Persona 1: Student**
- Role: Submit feedback about counselling sessions
- Goals: Provide honest feedback anonymously or with identity, view own feedback history
- Pain Points: Need safe space to share experiences without fear of identification

**Persona 2: Head Counsellor (Head Admin)**
- Role: Monitor institution-wide counselling quality
- Goals: Identify at-risk counsellors, track trends, approve new Head Counsellor registrations
- Pain Points: Need quick access to aggregated data and flagged issues

**Persona 3: Admin**
- Role: Manage counsellor database and system operations
- Goals: Add/edit/deactivate counsellors, approve Head Counsellor registrations, export reports
- Pain Points: Need efficient tools to manage counsellor roster and access control

### 2.2 Core Usage Scenarios

- Student registers with email verification, logs in, submits feedback about a counsellor, views own feedback history
- Anonymous user scans QR code, submits feedback without login
- Head Counsellor registers, waits for admin approval, logs in, views institution-wide analytics, filters by team/date, identifies flagged counsellors, exports reports
- Admin logs in, manages counsellor directory, approves pending Head Counsellor registrations, exports institution-wide data

---

## 3. User Stories

### 3.1 Student Stories
- As a student, I want to register with my email and student ID so that I can submit feedback
- As a student, I want to verify my email so that my account is activated
- As a student, I want to log in with email/password so that I can access my dashboard
- As a student, I want to submit feedback about a counsellor with star ratings, recommendation, and comments so that I can share my experience
- As a student, I want to choose anonymous or non-anonymous submission so that I control my privacy
- As a student, I want to view my feedback history so that I can track my submissions

### 3.2 Head Counsellor Stories
- As a Head Counsellor, I want to register with my email and phone so that I can request access
- As a Head Counsellor, I want to wait for admin approval so that my account is activated
- As a Head Counsellor, I want to log in after approval so that I can access institution-wide analytics
- As a Head Counsellor, I want to view all counsellors' performance metrics so that I can monitor quality
- As a Head Counsellor, I want to filter by date range and team so that I can analyze specific segments
- As a Head Counsellor, I want to see flagged counsellors with low ratings so that I can take action
- As a Head Counsellor, I want to drill into individual counsellor details so that I can review specific feedback
- As a Head Counsellor, I want to export reports in PPT/PDF/Excel so that I can share with stakeholders

### 3.3 Admin Stories
- As an Admin, I want to log in with institution-provided credentials so that I can access admin dashboard
- As an Admin, I want to add/edit/deactivate counsellors so that I can maintain accurate directory
- As an Admin, I want to approve or reject pending Head Counsellor registrations so that I control access
- As an Admin, I want to view institution-wide analytics so that I can monitor overall performance
- As an Admin, I want to export reports so that I can generate institutional reports

### 3.4 Anonymous User Stories
- As an anonymous user, I want to scan a counsellor's QR code so that I can submit feedback without login
- As an anonymous user, I want to submit feedback with pre-filled counsellor selection so that the process is quick

---

## 4. Functional Requirements

### 4.1 Authentication and Authorization

#### 4.1.1 Student Registration
- Form fields: email, password, full name, student/institution ID, phone (optional)
- Email verification required before account activation
- On successful registration, send verification email
- On email verification, activate account and allow login

#### 4.1.2 Head Counsellor Registration
- Form fields: email, password, full name, phone
- Registration status: pending
- Require admin approval before account activation
- On approval, activate account and send notification email
- On rejection, send notification email with reason

#### 4.1.3 Admin Account Creation
- Admin accounts created by institution only
- No public registration flow

#### 4.1.4 Login
- Student login: email + password
- Head Counsellor login: email + password (only if approved)
- Admin login: email + password
- JWT token issued on successful login
- Role-based redirect: Student → Student Dashboard, Head Counsellor → Head Counsellor Dashboard, Admin → Admin Dashboard

#### 4.1.5 Role-Based Access Control
- Student: submit feedback, view own feedback history
- Head Counsellor: view all counsellors' analytics, filter by date/team, approve Head Counsellor registrations, export reports
- Admin: manage counsellors, approve Head Counsellor registrations, view analytics, export reports
- Enforce access control at API level with JWT role claims

### 4.2 Public Pages

#### 4.2.1 Landing Page
- IIT Madras logo + Wellness Centre branding
- Hero section with call-to-action buttons
- Navigation to role selection or login
- Dark/light mode toggle
- Responsive layout for mobile/tablet/desktop

#### 4.2.2 Role Selection Page
- Display three role options: Student, Head Counsellor, Admin
- Each option leads to corresponding login page
- Student option includes link to registration page

#### 4.2.3 Feedback Form (QR Code Entry)
- Accessible via unique QR code per counsellor
- No login required
- Counsellor pre-selected from QR code parameter
- Form fields:
  - Counsellor dropdown (if not pre-filled)
  - 10 star-rating questions (1-5 stars): q1_comfort, q2_understood, q3_time, q4_advice, q5_respected, q6_supported, q7_hopeful, q8_safe, q9_communication, q10_overall
  - Recommendation: Yes/No/Maybe (single choice)
  - Comments (text area, optional)
  - Anonymous submission checkbox
- On submit, write to database with counsellor_id, ratings, recommendation, comments, anonymous flag, timestamp
- Display success message after submission

### 4.3 Student Portal

#### 4.3.1 Student Dashboard
- Welcome message with student name
- Quick access to submit feedback and view feedback history
- Display recent feedback submissions

#### 4.3.2 Submit Feedback
- Same form as QR Code Entry
- Manual counsellor selection from dropdown (populated from active counsellors)
- Logged-in student can choose anonymous or non-anonymous submission

#### 4.3.3 My Feedback History
- List of feedback submissions by logged-in student
- Display for each submission: counsellor name, submission date, 10 star ratings, recommendation, comments, anonymous flag
- Filter by date range: This Week / This Month / Custom / All Time
- Pagination for large datasets

### 4.4 Head Counsellor Portal

#### 4.4.1 Head Counsellor Dashboard
- Institution-wide analytics:
  - Total feedback count
  - Average rating across all counsellors
  - Recommendation breakdown (pie chart)
  - Monthly feedback trend (line/bar chart)
  - Average rating per question (bar chart)
- Date range filter: This Week / This Month / Custom / All Time
- Team filter: filter by counsellor designation
- Counsellor leaderboard: ranked list by average rating, feedback count, recommendation percentage
- Flagged counsellors: list counsellors with average rating < 3.2
- Export reports: PPT, PDF, Excel for filtered data

#### 4.4.2 Counsellor Detail Page
- Individual counsellor analytics:
  - Name, designation, specialization, email
  - Average rating
  - Feedback count
  - Recommendation breakdown
  - Monthly trend
  - Average rating per question
  - List of individual feedback submissions with date, ratings, recommendation, comments
- QR code generation: display unique QR code linking to feedback form with counsellor_id pre-filled
- Download QR code image
- Export counsellor-specific reports: PPT, PDF, Excel

#### 4.4.3 Approve Head Counsellor Registrations
- List of pending Head Counsellor registration requests
- Display for each request: name, email, phone, request date
- Approve or Reject buttons
- On approval, activate account and send notification email
- On rejection, send notification email

### 4.5 Admin Portal

#### 4.5.1 Admin Dashboard
- Institution-wide analytics (same as Head Counsellor Dashboard)
- Links to:
  - Manage Counsellors
  - Approve Head Counsellor Registrations
  - Export Reports

#### 4.5.2 Manage Counsellors
- List all counsellors with details: name, designation, specialization, email, active/inactive status
- Add new counsellor: form with name, designation, specialization, email
- Edit counsellor: update name, designation, specialization, email
- Toggle active/inactive status
- Search by name or email
- Pagination for large datasets

#### 4.5.3 Approve Head Counsellor Registrations
- Same as Head Counsellor Portal (Section 4.4.3)

#### 4.5.4 Export Reports
- Export institution-wide or counsellor-specific data
- Formats: PPT, PDF, Excel
- Date range filter: This Week / This Month / Custom / All Time

### 4.6 Common Features

#### 4.6.1 Dark/Light Mode
- Toggle switch in navigation bar
- Persist user preference in local storage
- Apply theme across all pages

#### 4.6.2 Responsive Layout
- Mobile-first design
- Breakpoints: mobile (< 768px), tablet (768px - 1024px), desktop (> 1024px)
- Sticky navigation bar
- Collapsible sidebar for mobile

#### 4.6.3 Search, Filters, Sorting, Pagination
- Search: counsellor name, email in counsellor directory
- Filters: date range, team/designation, active/inactive status
- Sorting: by name, rating, feedback count
- Pagination: 10/20/50 items per page

#### 4.6.4 Loading States and Notifications
- Loading spinners for API calls
- Success notifications: green toast with checkmark icon
- Error notifications: red toast with error icon
- Auto-dismiss after 3 seconds

---

## 5. Non-Functional Requirements

### 5.1 Performance
- Page load time: < 2 seconds on 3G network
- API response time: < 500ms for 95th percentile
- Lazy loading for images and components
- Code splitting for route-based chunks
- Image optimization: WebP format, responsive sizes
- API caching: cache GET requests for 5 minutes
- Optimized MySQL queries with indexes

### 5.2 Security
- JWT authentication with 1-hour expiration
- Refresh token mechanism
- Password hashing with bcrypt
- Input validation on client and server (React Hook Form + Zod)
- SQL injection prevention with parameterized queries
- XSS prevention with sanitized inputs
- CORS configuration for allowed origins
- HTTPS only in production
- Environment variables for sensitive data
- Rate limiting on API endpoints
- Logging for security events

### 5.3 Accessibility (WCAG 2.1 AA)
- Semantic HTML elements
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus indicators for all interactive elements
- Color contrast ratio ≥ 4.5:1 for text
- Alt text for images
- Screen reader compatibility
- Form labels and error messages

### 5.4 Scalability
- Modular API architecture
- Database connection pooling
- Horizontal scaling support for backend
- CDN for static assets
- Database indexing for frequently queried fields

### 5.5 Maintainability
- TypeScript for type safety
- ESLint and Prettier for code consistency
- Component-based architecture
- Reusable UI components from shadcn/ui
- Centralized state management with Zustand
- API service layer abstraction
- Environment-based configuration

---

## 6. Page and Component Map

### 6.1 Page Hierarchy

```
Wellness Centre Platform (Web)
├── Public Pages
│   ├── Landing Page
│   ├── Role Selection Page
│   ├── Student Registration Page
│   ├── Email Verification Page
│   ├── Student Login Page
│   ├── Head Counsellor Registration Page
│   ├── Head Counsellor Login Page
│   ├── Admin Login Page
│   └── Feedback Form Page (QR Code Entry)
├── Student Portal
│   ├── Student Dashboard
│   ├── Submit Feedback
│   └── My Feedback History
├── Head Counsellor Portal
│   ├── Head Counsellor Dashboard
│   ├── Counsellor Detail Page
│   └── Approve Head Counsellor Registrations
└── Admin Portal
    ├── Admin Dashboard
    ├── Manage Counsellors
    ├── Approve Head Counsellor Registrations
    └── Export Reports
```

### 6.2 Reusable Components

- **Navigation Bar**: Logo, role-based menu, dark/light mode toggle, logout button
- **Sidebar**: Collapsible navigation for mobile, role-based menu items
- **Feedback Form**: 10 star-rating inputs, recommendation radio buttons, comments textarea, anonymous checkbox, submit button
- **Analytics Card**: Metric title, value, trend indicator, chart
- **Counsellor Card**: Name, designation, specialization, email, active status, action buttons
- **Data Table**: Sortable columns, pagination, search, filters
- **Chart Components**: Line chart, bar chart, pie chart (using Recharts)
- **QR Code Display**: QR code image, download button
- **Modal**: Confirmation dialogs, forms
- **Toast Notification**: Success/error messages
- **Loading Spinner**: Full-page or inline loading indicator
- **Date Range Picker**: Preset ranges (This Week, This Month, Custom, All Time)
- **Filter Panel**: Team filter, date range filter, status filter

---

## 7. Data Models

### 7.1 MySQL Schema

#### 7.1.1 users Table

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role ENUM('Student', 'Head_Counsellor', 'Admin') NOT NULL,
  student_id VARCHAR(100),
  phone VARCHAR(20),
  email_verified BOOLEAN DEFAULT FALSE,
  status ENUM('pending', 'approved', 'rejected', 'active') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_status (status)
);
```

#### 7.1.2 counsellors Table

```sql
CREATE TABLE counsellors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  designation VARCHAR(255),
  specialization VARCHAR(255),
  email VARCHAR(255),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_active (active),
  INDEX idx_designation (designation)
);
```

#### 7.1.3 feedback Table

```sql
CREATE TABLE feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  counsellor_id INT NOT NULL,
  user_id INT,
  q1_comfort INT CHECK (q1_comfort BETWEEN 1 AND 5),
  q2_understood INT CHECK (q2_understood BETWEEN 1 AND 5),
  q3_time INT CHECK (q3_time BETWEEN 1 AND 5),
  q4_advice INT CHECK (q4_advice BETWEEN 1 AND 5),
  q5_respected INT CHECK (q5_respected BETWEEN 1 AND 5),
  q6_supported INT CHECK (q6_supported BETWEEN 1 AND 5),
  q7_hopeful INT CHECK (q7_hopeful BETWEEN 1 AND 5),
  q8_safe INT CHECK (q8_safe BETWEEN 1 AND 5),
  q9_communication INT CHECK (q9_communication BETWEEN 1 AND 5),
  q10_overall INT CHECK (q10_overall BETWEEN 1 AND 5),
  recommendation ENUM('Yes', 'No', 'Maybe'),
  comments TEXT,
  anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (counsellor_id) REFERENCES counsellors(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_counsellor_id (counsellor_id),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);
```

#### 7.1.4 Sample Data

```sql
-- Sample Admin
INSERT INTO users (email, password_hash, full_name, role, status) VALUES
('admin@iitm.ac.in', '$2b$10$...', 'Admin User', 'Admin', 'active');

-- Sample Counsellors
INSERT INTO counsellors (name, designation, specialization, email, active) VALUES
('Dr. Priya Sharma', 'Senior Counsellor', 'Anxiety & Stress', 'priya@iitm.ac.in', TRUE),
('Dr. Rajesh Kumar', 'Counsellor', 'Depression', 'rajesh@iitm.ac.in', TRUE),
('Dr. Anita Desai', 'Junior Counsellor', 'Academic Stress', 'anita@iitm.ac.in', TRUE);

-- Sample Student
INSERT INTO users (email, password_hash, full_name, role, student_id, phone, email_verified, status) VALUES
('student@iitm.ac.in', '$2b$10$...', 'Student User', 'Student', 'CS21B001', '9876543210', TRUE, 'active');

-- Sample Feedback
INSERT INTO feedback (counsellor_id, user_id, q1_comfort, q2_understood, q3_time, q4_advice, q5_respected, q6_supported, q7_hopeful, q8_safe, q9_communication, q10_overall, recommendation, comments, anonymous) VALUES
(1, 2, 5, 5, 4, 5, 5, 5, 4, 5, 5, 5, 'Yes', 'Very helpful session', FALSE),
(1, NULL, 4, 4, 3, 4, 4, 4, 3, 4, 4, 4, 'Maybe', 'Good but could be better', TRUE);
```

#### 7.1.5 Database Migrations

- Migration 001: Create users table
- Migration 002: Create counsellors table
- Migration 003: Create feedback table
- Migration 004: Add indexes for performance optimization
- Migration 005: Add constraints for data integrity

### 7.2 Relationships

- **users (1) → feedback (N)**: One user can submit multiple feedback entries
- **counsellors (1) → feedback (N)**: One counsellor can receive multiple feedback entries
- **feedback.user_id**: NULL if anonymous submission

---

## 8. API Contract

### 8.1 Authentication Endpoints

#### POST /api/auth/register/student
- Request Body: `{ email, password, full_name, student_id, phone }`
- Response: `{ message, user_id }`
- Status: 201 Created

#### POST /api/auth/register/head-counsellor
- Request Body: `{ email, password, full_name, phone }`
- Response: `{ message, user_id, status: 'pending' }`
- Status: 201 Created

#### POST /api/auth/verify-email
- Request Body: `{ token }`
- Response: `{ message }`
- Status: 200 OK

#### POST /api/auth/login
- Request Body: `{ email, password, role }`
- Response: `{ token, refresh_token, user: { id, email, full_name, role } }`
- Status: 200 OK

#### POST /api/auth/refresh
- Request Body: `{ refresh_token }`
- Response: `{ token }`
- Status: 200 OK

#### POST /api/auth/logout
- Headers: `Authorization: Bearer <token>`
- Response: `{ message }`
- Status: 200 OK

### 8.2 Feedback Endpoints

#### POST /api/feedback
- Request Body: `{ counsellor_id, q1_comfort, q2_understood, ..., q10_overall, recommendation, comments, anonymous }`
- Headers: `Authorization: Bearer <token>` (optional for anonymous)
- Response: `{ message, feedback_id }`
- Status: 201 Created

#### GET /api/feedback/my-history
- Headers: `Authorization: Bearer <token>`
- Query Params: `?date_range=this_week&page=1&limit=10`
- Response: `{ feedback: [...], total, page, limit }`
- Status: 200 OK

### 8.3 Counsellor Endpoints

#### GET /api/counsellors
- Query Params: `?active=true&search=name&page=1&limit=10`
- Response: `{ counsellors: [...], total, page, limit }`
- Status: 200 OK

#### GET /api/counsellors/:id
- Response: `{ id, name, designation, specialization, email, active }`
- Status: 200 OK

#### POST /api/counsellors
- Headers: `Authorization: Bearer <token>` (Admin only)
- Request Body: `{ name, designation, specialization, email }`
- Response: `{ message, counsellor_id }`
- Status: 201 Created

#### PUT /api/counsellors/:id
- Headers: `Authorization: Bearer <token>` (Admin only)
- Request Body: `{ name, designation, specialization, email, active }`
- Response: `{ message }`
- Status: 200 OK

#### DELETE /api/counsellors/:id
- Headers: `Authorization: Bearer <token>` (Admin only)
- Response: `{ message }`
- Status: 200 OK

### 8.4 Analytics Endpoints

#### GET /api/analytics/institution
- Headers: `Authorization: Bearer <token>` (Head Counsellor or Admin)
- Query Params: `?date_range=this_month&team=Senior%20Counsellor`
- Response: `{ total_feedback, avg_rating, recommendation_breakdown, monthly_trend, question_averages, flagged_counsellors }`
- Status: 200 OK

#### GET /api/analytics/counsellor/:id
- Headers: `Authorization: Bearer <token>` (Head Counsellor or Admin)
- Query Params: `?date_range=this_month`
- Response: `{ counsellor_info, avg_rating, feedback_count, recommendation_breakdown, monthly_trend, question_averages, feedback_list }`
- Status: 200 OK

#### GET /api/analytics/leaderboard
- Headers: `Authorization: Bearer <token>` (Head Counsellor or Admin)
- Query Params: `?date_range=this_month&team=Senior%20Counsellor`
- Response: `{ leaderboard: [{ counsellor_id, name, avg_rating, feedback_count, recommendation_percentage }] }`
- Status: 200 OK

### 8.5 Admin Endpoints

#### GET /api/admin/pending-registrations
- Headers: `Authorization: Bearer <token>` (Admin or Head Counsellor)
- Response: `{ registrations: [{ user_id, email, full_name, phone, role, created_at }] }`
- Status: 200 OK

#### POST /api/admin/approve-registration/:user_id
- Headers: `Authorization: Bearer <token>` (Admin or Head Counsellor)
- Response: `{ message }`
- Status: 200 OK

#### POST /api/admin/reject-registration/:user_id
- Headers: `Authorization: Bearer <token>` (Admin or Head Counsellor)
- Request Body: `{ reason }`
- Response: `{ message }`
- Status: 200 OK

### 8.6 Export Endpoints

#### GET /api/export/ppt
- Headers: `Authorization: Bearer <token>` (Head Counsellor or Admin)
- Query Params: `?counsellor_id=1&date_range=this_month`
- Response: Binary file (application/vnd.openxmlformats-officedocument.presentationml.presentation)
- Status: 200 OK

#### GET /api/export/pdf
- Headers: `Authorization: Bearer <token>` (Head Counsellor or Admin)
- Query Params: `?counsellor_id=1&date_range=this_month`
- Response: Binary file (application/pdf)
- Status: 200 OK

#### GET /api/export/excel
- Headers: `Authorization: Bearer <token>` (Head Counsellor or Admin)
- Query Params: `?counsellor_id=1&date_range=this_month`
- Response: Binary file (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)
- Status: 200 OK

### 8.7 QR Code Endpoint

#### GET /api/qr-code/:counsellor_id
- Response: `{ qr_code_url, feedback_url }`
- Status: 200 OK

---

## 9. Security Rules

### 9.1 Authentication
- JWT tokens with 1-hour expiration
- Refresh tokens with 7-day expiration
- Tokens stored in httpOnly cookies or local storage (client decision)
- Password hashing with bcrypt (salt rounds: 10)

### 9.2 Authorization
- Role-based access control enforced at API level
- Middleware to verify JWT and extract role claims
- Endpoint-level role checks:
  - Student: /api/feedback, /api/feedback/my-history
  - Head Counsellor: /api/analytics/*, /api/admin/pending-registrations, /api/admin/approve-registration, /api/admin/reject-registration, /api/export/*
  - Admin: /api/counsellors (CRUD), /api/admin/*, /api/analytics/*, /api/export/*

### 9.3 Input Validation
- Client-side: React Hook Form + Zod schemas
- Server-side: Express middleware with Zod validation
- Sanitize inputs to prevent XSS
- Parameterized queries to prevent SQL injection

### 9.4 Rate Limiting
- Login endpoint: 5 requests per minute per IP
- Feedback submission: 10 requests per hour per user
- Export endpoints: 5 requests per minute per user

### 9.5 Environment Variables
- Database credentials
- JWT secret keys
- Email service credentials
- File storage credentials
- API keys for third-party services

### 9.6 Logging
- Log all authentication attempts (success/failure)
- Log all admin actions (counsellor CRUD, registration approvals)
- Log all feedback submissions
- Log all export requests
- Store logs in secure location with rotation policy

---

## 10. Performance Targets

### 10.1 Frontend
- First Contentful Paint (FCP): < 1.5 seconds
- Largest Contentful Paint (LCP): < 2.5 seconds
- Time to Interactive (TTI): < 3 seconds
- Cumulative Layout Shift (CLS): < 0.1
- Bundle size: < 500 KB (gzipped)

### 10.2 Backend
- API response time (95th percentile): < 500ms
- Database query time (95th percentile): < 100ms
- Concurrent users: 1000+
- Uptime: 99.9%

### 10.3 Optimization Strategies
- Lazy loading for routes and components
- Code splitting for vendor and app bundles
- Image optimization: WebP format, responsive sizes, lazy loading
- API caching: cache GET requests for 5 minutes using Redis or in-memory cache
- Database indexing: index frequently queried fields (email, counsellor_id, created_at)
- Connection pooling for database connections
- CDN for static assets

---

## 11. Accessibility Checklist (WCAG 2.1 AA)

- [ ] Semantic HTML elements (header, nav, main, footer, article, section)
- [ ] ARIA labels for all interactive elements (buttons, links, form inputs)
- [ ] Keyboard navigation support (Tab, Enter, Escape, Arrow keys)
- [ ] Focus indicators visible for all interactive elements
- [ ] Color contrast ratio ≥ 4.5:1 for normal text, ≥ 3:1 for large text
- [ ] Alt text for all images
- [ ] Form labels associated with inputs
- [ ] Error messages announced to screen readers
- [ ] Skip to main content link
- [ ] Responsive text sizing (rem units)
- [ ] No flashing content (seizure risk)
- [ ] Captions for video content (if applicable)
- [ ] Screen reader testing with NVDA/JAWS

---

## 12. Deployment Notes

### 12.1 Environment Setup
- Development: Local MySQL, Node.js server, Vite dev server
- Staging: Cloud MySQL (AWS RDS or similar), Node.js on cloud VM, Nginx reverse proxy
- Production: Cloud MySQL with replication, Node.js cluster mode, Nginx load balancer, HTTPS with SSL certificate

### 12.2 Build Process
- Frontend: `npm run build` → generates optimized static files in `dist/`
- Backend: `npm run build` → transpiles TypeScript to JavaScript in `build/`

### 12.3 Deployment Steps
1. Set environment variables in `.env` file
2. Run database migrations: `npm run migrate`
3. Build frontend: `npm run build`
4. Build backend: `npm run build`
5. Start backend server: `npm run start`
6. Serve frontend static files via Nginx or CDN
7. Configure SSL certificate for HTTPS
8. Set up monitoring and logging (e.g., PM2, Winston, Sentry)

### 12.4 CI/CD Pipeline
- Use GitHub Actions or GitLab CI for automated testing: unit tests, integration tests, E2E tests
- Deployment configuration is managed separately when ready to publish

### 12.5 Monitoring
- Application monitoring: PM2, New Relic, or Datadog
- Error tracking: Sentry
- Log aggregation: ELK stack or CloudWatch
- Uptime monitoring: Pingdom or UptimeRobot

---

## 13. Business Rules and Logic

### 13.1 Registration and Approval Flow
- Student registration: email verification required, account activated after verification
- Head Counsellor registration: status set to \"pending\", requires admin or Head Counsellor approval
- Admin accounts: created by institution, no public registration

### 13.2 Feedback Submission Logic
- Anonymous flag: if checked, user_id set to NULL in database
- Counsellor selection: required field, populated from active counsellors only
- Star ratings: 1-5 scale for each of 10 questions, all required
- Recommendation: single-choice (Yes/No/Maybe), required
- Comments: optional text field

### 13.3 Analytics Calculation
- Average rating: mean of all 10 star ratings across feedback submissions
- Recommendation percentage: (Yes count / Total count) * 100
- Monthly trend: group feedback by month, calculate average rating per month
- Question averages: calculate average rating for each of 10 questions
- Flagged counsellors: counsellors with average rating < 3.2

### 13.4 QR Code Generation
- Each counsellor has unique QR code generated from counsellor_id
- QR code encodes URL: `{FRONTEND_URL}/feedback?cid={id}` (defaults to `http://localhost:50000/feedback?cid={id}` in local development)
- Scanning QR code opens feedback form with counsellor pre-selected

### 13.5 Export Logic
- Date range filter applied to feedback records before export
- PPT export: generate slides with charts and tables using library (e.g., pptxgenjs)
- PDF export: render dashboard as PDF using library (e.g., puppeteer)
- Excel export: generate spreadsheet with raw data and summary using library (e.g., exceljs)
- Head Counsellor/Admin: export any counsellor or full dataset

### 13.6 Team Filter Logic
- Head Counsellor can filter counsellors by designation (team)
- Display team-specific analytics and leaderboard

---

## 14. Exception and Boundary Conditions

| Scenario | Handling |
|----------|----------|
| User submits feedback without selecting counsellor | Display error: \"Please select a counsellor\" |
| User submits feedback with missing star ratings | Display error: \"Please rate all questions\" |
| Student registers with existing email | Display error: \"Email already registered\" |
| Student registers but does not verify email | Account not activated, verification email can be resent |
| Student login with incorrect password | Display error: \"Invalid email or password\" |
| Head Counsellor login before approval | Display error: \"Your account is pending approval\" |
| Head Counsellor login after rejection | Display error: \"Your registration was rejected\" |
| Student tries to access Head Counsellor/Admin portal | Redirect to Student Dashboard or display \"Access Denied\" |
| Head Counsellor tries to access Admin-only features | Display \"Access Denied\" |
| Counsellor has no feedback yet | Display message: \"No feedback received yet\" |
| Export with no data in selected date range | Display message: \"No data available for selected date range\" |
| QR code scan fails | Display error: \"Invalid QR code, please try again\" |
| Database connection fails | Display error: \"Unable to connect to server, please try again later\" |
| API request timeout | Display error: \"Request timed out, please try again\" |
| User forgets password | Provide password reset link via email (future feature) |

---

## 15. Acceptance Criteria

1. New student registers via Student Registration Page with email, password, full name, student ID, phone, submits form, receives verification email, clicks verification link, account activated, logs in via Student Login Page, redirected to Student Dashboard.
2. Registered student logs in via Student Login Page with email and password, redirected to Student Dashboard, submits feedback about a counsellor with 10 star ratings, recommendation, and comments, views own feedback history showing submission date and ratings.
3. Anonymous user scans counsellor QR code, feedback form opens with counsellor pre-selected, submits feedback without login, receives success message.
4. Head Counsellor registers via Head Counsellor Registration Page, status set to \"pending\", admin logs in, approves registration, Head Counsellor receives notification email, logs in, redirected to Head Counsellor Dashboard.
5. Head Counsellor logs in, views institution-wide analytics with total feedback count, average rating, recommendation breakdown, monthly trend, filters by date range \"This Month\" and team \"Senior Counsellor\", views counsellor leaderboard, identifies flagged counsellors with average rating < 3.2.
6. Head Counsellor drills into individual counsellor detail page, views counsellor-specific analytics, generates QR code, downloads QR code image, exports counsellor data as Excel file.
7. Admin logs in, navigates to Manage Counsellors page, adds new counsellor with name, designation, specialization, email, toggles active status, searches for counsellor by name, edits counsellor information.
8. Admin navigates to Approve Head Counsellor Registrations page, views pending requests, approves one request, rejects another with reason, approved user receives notification email.

---

## 16. Features Not Included in This Release

- Password reset functionality (forgot password flow)
- Two-factor authentication (2FA)
- Real-time notifications (push notifications, WebSockets)
- Advanced AI sentiment analysis with NLP models
- Multi-language support (only English in this release)
- Video call integration for counselling sessions
- Automated appointment scheduling system
- Integration with external mental health resources APIs
- Gamification features for students
- Social sharing of feedback or achievements
- In-app messaging between students and counsellors
- Mobile application (iOS/Android native apps)
- Offline mode
- Advanced data visualization with D3.js
- Machine learning model training for personalized recommendations
- Multi-tenancy support for multiple institutions
- Custom branding per institution
- Wearable device integration for biometric data
- Third-party payment gateway integration
- Public API for third-party integrations
- Audit logs for all user actions
- Data retention policies and GDPR compliance features