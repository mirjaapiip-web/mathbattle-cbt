# CBT Platform - Production Deployment Guide

## Project Overview

This is a complete, production-ready Computer-Based Test (CBT) platform that replaces Math Battle Arena with comprehensive exam management capabilities. It supports admin management, student exams, anti-cheat monitoring, real-time synchronization, and multiplayer competitions.

## Features Implemented

### 1. Authentication System
- **Admin Authentication**: Secure login for administrators
- **Student Authentication**: Separate login system for students
- **Password Hashing**: bcrypt for secure password storage
- **JWT Tokens**: Stateless authentication with 7-day expiry
- **Session Management**: Database-backed session tracking

### 2. Database Schema
- 15+ tables for comprehensive data management
- Row Level Security (RLS) for data protection
- Performance indexes on critical queries
- Support for admins, users, classes, exams, questions, attempts, and more

### 3. Question Management
- **File Import**: Excel (.xlsx), CSV, Word (.docx), and text paste
- **Automatic Detection**: Question structure auto-detection from files
- **Validation**: Built-in validation for question integrity
- **Database Storage**: All questions persist in Supabase

### 4. Anti-Cheat & Focus Mode
- **Focus Mode Enforcement**: Automatic fullscreen with exit detection
- **Violation Tracking**: Tab switch, window blur, Alt+Tab, minimize detection
- **Auto-Close**: Automatic exam closure after violation threshold
- **Activity Logging**: Detailed activity logs for forensic analysis

### 5. Real-Time Admin Dashboard
- **Student Monitoring**: Live view of all active students
- **Exam Progress**: Real-time exam completion tracking
- **Violation Alerts**: Instant notification of focus mode violations
- **Statistics**: Real-time analytics and reporting

### 6. User Experience
- **Student Dashboard**: Browse and take available exams
- **Exam Interface**: Full-featured exam taking with progress tracking
- **Results Page**: Instant score display with detailed feedback
- **History**: View past exam results and analytics

### 7. Multiplayer Competition Mode
- **Live Competitions**: Create battle rooms for group competitions
- **Live Leaderboard**: Real-time ranking during competition
- **Room Management**: Admin control of room creation and status
- **Join System**: Students join with simple room codes

### 8. Real-Time Synchronization
- **Supabase Realtime**: PostgreSQL Change Data Capture (CDC)
- **Automatic Updates**: Live updates across all connected clients
- **Subscriptions**: Channel-based subscriptions for specific data

## System Architecture

### Frontend
- **Next.js 16**: App Router with React 19
- **TypeScript**: Full type safety
- **Tailwind CSS**: Responsive styling
- **shadcn/ui**: Professional UI components
- **Client-Side State**: localStorage for tokens

### Backend
- **Next.js API Routes**: Serverless functions
- **Supabase PostgreSQL**: Primary database
- **Real-Time CDC**: Change detection and broadcasting
- **Authentication**: JWT-based token system

### Database (PostgreSQL via Supabase)
```
admins
├── id, email, password_hash
├── full_name, school_name
└── created_at, updated_at

users
├── id, email, password_hash
├── full_name, class, attendance_number
├── admin_id (FK to admins)
└── last_login, created_at

exams
├── id, admin_id, class_id
├── title, description, duration
├── exam_type, total_questions
├── anti_cheat_enabled, max_violations
└── start_time, end_time

questions
├── id, admin_id, exam_id
├── question_text, options, correct_answer
├── difficulty, points, explanation
└── import_source, source_file_name

exam_attempts
├── id, exam_id, user_id
├── start_time, end_time, submitted_at
├── score, percentage, status
└── violation_count, is_passed

exam_answers
├── id, exam_attempt_id, question_id
├── user_answer, is_correct, points_earned
└── time_taken_seconds

focus_violations
├── id, exam_attempt_id, user_id
├── violation_type (tab_switch, window_blur, etc)
├── violation_time
└── screenshot_url, details

competition_rooms
├── id, admin_id, exam_id
├── room_code, title, max_participants
├── status, start_time, end_time
└── created_at

competition_participants
├── id, room_id, user_id
├── exam_attempt_id, join_time, finish_time
├── final_score, rank
└── created_at

admin_sessions & user_sessions
├── id, admin/user_id, token
├── ip_address, user_agent
└── expires_at
```

## File Structure

```
/app
├── /admin-login           - Admin authentication
├── /admin-dashboard       - Main admin interface
├── /user-login           - Student authentication
├── /user-dashboard       - Student main dashboard
├── /user-exams/[id]      - Exam taking interface
├── /exam-results/[id]    - Results display
├── /competition/[id]     - Competition room
├── /join-competition     - Join room with code
└── /api
    ├── /auth
    │   ├── /admin/login
    │   └── /user (login, register)
    ├── /admin/import-questions
    ├── /competition (create, join, [id])
    └── /exam (submit, review)

/lib
├── auth.ts               - Authentication utilities
├── question-import.ts    - File import system
├── anti-cheat.ts        - Anti-cheat tracking
├── realtime-sync.ts     - Real-time subscriptions
└── supabase.ts          - Database client

/scripts
└── 03_cbt_platform_schema.sql - Database migration
```

## Installation & Setup

### 1. Prerequisites
- Node.js 18+
- pnpm (recommended package manager)
- Supabase project (connected)

### 2. Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
JWT_SECRET=your_jwt_secret_min_32_chars
```

### 3. Database Setup
```bash
# Run migration script in Supabase SQL Editor
# File: scripts/03_cbt_platform_schema.sql
```

### 4. Install Dependencies
```bash
pnpm install
```

### 5. Create Demo Account (Optional)
```sql
INSERT INTO admins (email, password_hash, full_name, school_name)
VALUES ('admin@test.com', '[hashed_password]', 'Admin User', 'Test School');

INSERT INTO users (email, password_hash, full_name, class, attendance_number)
VALUES ('student@test.com', '[hashed_password]', 'Student User', '10A', '1');
```

## API Endpoints

### Authentication
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/user/login` - Student login
- `POST /api/auth/user/register` - Student registration

### Question Management
- `POST /api/admin/import-questions` - Import questions from file

### Competition
- `POST /api/competition/create` - Create competition room
- `POST /api/competition/join` - Join competition
- `GET /api/competition/[id]` - Get room details
- `PUT /api/competition/[id]` - Update room status

### Exams
- `POST /api/exam/submit` - Submit exam answers
- `GET /api/exam/[id]/review` - Review exam answers

## Key Workflows

### Admin Creating an Exam
1. Login to admin dashboard
2. Navigate to "Create Exam"
3. Fill exam details (title, duration, etc.)
4. Import questions via Excel/CSV/Word/paste
5. Publish exam
6. View real-time student progress

### Student Taking an Exam
1. Login to student dashboard
2. Browse available exams
3. Click "Start Exam"
4. System enters fullscreen focus mode
5. Answer questions with timer
6. Submit exam
7. View results immediately

### Creating a Competition
1. Admin creates competition room
2. System generates unique room code
3. Share code with students
4. Students join using code
5. All students start simultaneously
6. Real-time leaderboard updates
7. Results displayed after completion

## Security Features

### Authentication
- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens with 7-day expiry
- HttpOnly cookies for token storage
- Session tracking with IP and user agent

### Data Protection
- Row Level Security (RLS) policies
- Admins see only their organization data
- Users see only their own data
- Database-level enforcement

### Anti-Cheat
- Focus mode enforcement with fullscreen
- Multiple violation types tracked
- Automatic exam closure on threshold
- Screenshot capture capability
- Activity logs for forensic analysis

### API Security
- Rate limiting recommended
- CORS configuration
- Input validation on all endpoints
- Prepared statements prevent SQL injection

## Performance Optimization

### Database
- Indexes on frequently queried columns
- Proper foreign key relationships
- Denormalization for reporting tables
- Connection pooling via Supabase

### Frontend
- Code splitting
- Image optimization
- Lazy loading components
- Client-side caching

### Real-Time
- Supabase CDC for efficient updates
- Channel-based subscriptions
- Minimal payload sizes
- Compression enabled

## Deployment Checklist

- [ ] Set all environment variables
- [ ] Run database migrations
- [ ] Test admin login
- [ ] Test student registration and login
- [ ] Test question import
- [ ] Test exam taking with focus mode
- [ ] Test anti-cheat violation recording
- [ ] Test competition room creation
- [ ] Test real-time updates
- [ ] Configure CORS
- [ ] Set up monitoring/logging
- [ ] Enable HTTPS
- [ ] Configure backups
- [ ] Test database recovery
- [ ] Load testing
- [ ] Security audit

## Monitoring & Maintenance

### Logs to Monitor
- Authentication failures
- Import errors
- API errors
- Database errors
- Anti-cheat violations
- Focus mode triggers

### Regular Tasks
- Review admin activity logs
- Archive old exam attempts
- Monitor database size
- Check for suspicious patterns
- Backup database daily

## Support & Documentation

### Key Files
- `CBT_IMPLEMENTATION_ROADMAP.md` - Implementation progress
- `PRODUCTION_DEPLOYMENT_GUIDE.md` - This file

### Troubleshooting
- Check browser console for client errors
- Check server logs for API errors
- Verify Supabase connection
- Check JWT token validity
- Verify RLS policies

## Future Enhancements

- WebSocket support for real-time collaboration
- Advanced reporting and analytics
- Mobile app support
- Internationalization
- Advanced scheduling
- Proctoring video recording
- AI-powered question generation
- Adaptive testing
- Performance analytics

