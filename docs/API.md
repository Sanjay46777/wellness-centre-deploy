# Wellness Centre API Documentation

Base URL: `http://localhost:3001` (or the configured `VITE_API_BASE_URL`).

All timestamps are ISO 8601 strings. The API uses JSON request/response bodies and Bearer token authentication for protected endpoints.

## Authentication

Protected endpoints require a header: `Authorization: Bearer <token>`.

### POST /api/auth/register/student

Register a new student account.

**Request body:**
```json
{
  "email": "student@iitm.ac.in",
  "password": "SecurePassword1!",
  "full_name": "A Student",
  "student_id": "CS21B001",
  "phone": "+91-9876543210"
}
```

**Response:**
```json
{
  "message": "Registration successful. You can now sign in.",
  "user_id": 5
}
```

### POST /api/auth/register/head-counsellor

Register a head-counsellor account (requires admin approval).

**Request body:**
```json
{
  "email": "head@iitm.ac.in",
  "password": "SecurePassword1!",
  "full_name": "Dr. Head Counsellor",
  "phone": "+91-9876543210"
}
```

**Response:**
```json
{
  "message": "Registration submitted. Please wait for admin approval.",
  "user_id": 6,
  "status": "pending"
}
```

### POST /api/auth/login

Authenticate a user and receive a JWT.

**Request body:**
```json
{
  "email": "wellness1@smail.iitm.ac.in",
  "password": "0&nMlqX3&yFkkHVx",
  "role": "admin"
}
```

**Response:**
```json
{
  "token": "eyJhbG...",
  "user": {
    "id": 1,
    "email": "wellness1@smail.iitm.ac.in",
    "full_name": "Admin User",
    "role": "admin"
  }
}
```

### GET /api/auth/me

Return the current authenticated user.

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "wellness1@smail.iitm.ac.in",
    "full_name": "Admin User",
    "role": "admin",
    "status": "approved"
  }
}
```

## Counsellors

### GET /api/counsellors

List all counsellors. Supports optional filters.

**Query params:**
- `active` — `true` or `false`
- `search` — search by name or email

**Response:**
```json
{
  "counsellors": [
    { "id": 1, "name": "Dr. Priya Sharma", "designation": "Senior Counsellor", ... }
  ]
}
```

### GET /api/counsellors/:id

Get a single counsellor by ID.

### POST /api/counsellors

Create a new counsellor (admin only).

**Request body:**
```json
{
  "name": "Dr. New Counsellor",
  "designation": "Counsellor",
  "specialization": "Stress",
  "email": "new@iitm.ac.in"
}
```

### PUT /api/counsellors/:id

Update a counsellor (admin only).

### DELETE /api/counsellors/:id

Delete a counsellor (admin only).

## Feedback

### POST /api/feedback

Submit a feedback form. Authentication is optional; anonymous submissions are allowed.

**Request body:**
```json
{
  "counsellor_id": 1,
  "q1_comfort": 5,
  "q2_understood": 5,
  "q3_time": 4,
  "q4_quality": 5,
  "q5_respected": 5,
  "q6_supported": 5,
  "q7_hopeful": 4,
  "q8_safe": 5,
  "q9_communication": 5,
  "q10_overall": 5,
  "recommendation": "Yes",
  "comments": "Very helpful session",
  "is_anonymous": false,
  "respondent_email": "student@iitm.ac.in"
}
```

### GET /api/feedback/my-history

List feedback submitted by the currently authenticated student.

## Analytics

### GET /api/analytics/institution

Return institution-wide analytics. Admin and head-counsellor roles only.

**Query params:**
- `range` — `week`, `month`, `all`, or `custom`
- `start`, `end` — required when `range=custom`
- `team` — filter by counsellor designation

**Response:**
```json
{
  "total_feedback": 120,
  "avg_rating": 4.32,
  "recommendation": { "counts": { "Yes": 90, "No": 10, "Maybe": 20 }, "total": 120, "yesPct": 75 },
  "monthly_trend": [...],
  "question_averages": [...],
  "flagged_counsellors": [...]
}
```

### GET /api/analytics/counsellor/:id

Return analytics for a single counsellor.

### GET /api/analytics/leaderboard

Return a counsellor leaderboard sorted by average rating.

## Admin

### GET /api/admin/pending-registrations

List pending head-counsellor registrations.

### POST /api/admin/approve-registration/:userId

Approve a pending head-counsellor registration.

### POST /api/admin/reject-registration/:userId

Reject a pending head-counsellor registration.

**Request body:**
```json
{
  "reason": "Profile does not meet requirements"
}
```

## Exports

### GET /api/export

Download feedback data as PPT, PDF, or Excel. Admin and head-counsellor roles only.

**Query params:**
- `format` — `ppt`, `pdf`, or `excel`
- `range` — date range filter
- `start`, `end` — custom date range
- `counsellor_id` — export for a single counsellor
- `team` — filter by designation

**Response:** File attachment (`Content-Disposition: attachment`).

## QR Code

### GET /api/qr-code/:counsellorId

Return a feedback URL for the given counsellor.

**Response:**
```json
{
  "feedback_url": "http://localhost:50000/feedback?cid=1",
  "counsellor_id": "1"
}
```

## Health

### GET /api/health

Basic health check.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-07-29T12:00:00.000Z"
}
```

## Error Responses

Standard error format:

```json
{
  "error": "Error message",
  "status": 400
}
```

Common status codes:
- `400` — Bad request / validation error
- `401` — Unauthorized (missing or invalid token)
- `403` — Forbidden (insufficient role or account not approved)
- `404` — Resource not found
- `409` — Conflict (e.g., email already registered)
- `422` — Validation error
- `429` — Too many requests
- `500` — Internal server error
