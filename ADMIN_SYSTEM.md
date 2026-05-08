# Admin System Enhancement - Complete Guide

## Overview

Math Battle Arena now includes a comprehensive admin system that allows administrators to manage game rooms, questions, and monitor player performance in real-time.

## Admin Access

### Admin Login
- Entry page now supports both Player and Admin roles
- Admin password: `admin123` (MVP - change in production)
- Requires Full Name and Class for identification

### Admin Dashboard
Accessible at `/admin/dashboard` after admin login

Main features:
- Create and manage game rooms
- Manage question bank
- View analytics and statistics
- Monitor active players in real-time

## Key Features

### 1. Game Room Management

**Create Game Rooms:**
- Navigate to Admin Dashboard → "Create Game Room"
- Configure:
  - Difficulty level (Easy/Medium/Hard)
  - Maximum number of players (2-36)
- System auto-generates unique room code
- Players join using the room code

**Room Code:**
- Unique 6-character alphanumeric code
- Easy for players to share and remember
- Automatically generated per room

### 2. Question Management System

#### View Question Bank
- Dashboard: "Manage Questions"
- View all available questions
- Filter by difficulty level
- Search functionality

#### Generate Questions with AI
**Process:**
1. Select Topic (e.g., "Arithmetic", "Algebra")
2. Choose Difficulty (Easy/Medium/Hard)
3. Set Number of Questions (1-20)
4. Click "Generate Questions"

**AI Testing:**
The system automatically tests generated questions for:
- No duplicate questions
- Valid correct answers
- Difficulty matches complexity

**Output Format (JSON):**
```json
{
  "id": "gen_timestamp_index",
  "question": "12 + 8 = ?",
  "difficulty": "easy",
  "options": ["20", "18", "22", "16"],
  "correctAnswer": 0,
  "explanation": "The correct answer is 20. 12 + 8 = 20.",
  "createdAt": "2026-04-20T..."
}
```

#### Import Questions
**Supported Formats:**
- CSV (.csv)
- Excel (.xlsx)
- Word documents (.docx)

**Expected CSV Format:**
```
Question,Difficulty,Option1,Option2,Option3,Option4,CorrectAnswer,Explanation
12 + 8 = ?,easy,20,18,22,16,1,"12 + 8 = 20"
```

*(File upload coming soon)*

### 3. Player Data Tracking

#### Player Information
Each player provides:
- Full Name
- Class
- Attendance Number (Absen)

#### Admin Monitoring
Real-time player table displays:
- Full Name
- Class
- Attendance Number
- Current Score
- Session Status (active/completed/idle)
- Join Time

#### Data Flow
```
Player Entry → Session Created → Dashboard → Game → Admin Panel
```

### 4. Multiplayer Room Control

**Only Admin Can:**
- Create game rooms
- Generate room codes
- Start games
- End games

**Player Can:**
- Join existing rooms using admin-provided code
- Play in active games
- View leaderboard

**Room Features:**
- Auto-generates unique code per room
- Tracks active players
- Monitors game status (waiting/active/finished)
- Real-time score updates

### 5. Admin Analytics Dashboard

**Accessible at:** `/admin/analytics`

**Metrics:**
- Total active players
- Games completed
- Average score
- Success rate (% correct answers)
- Performance by difficulty
- Top players leaderboard

**Real-Time Updates:**
- Player join/leave events
- Score changes
- Game status changes

## Admin Workflow Example

### Scenario: Create and Monitor a Game

1. **Admin logs in** with "Admin" role
2. **Creates a room:**
   - Difficulty: Medium
   - Max Players: 20
   - System generates: Code "ABC123"

3. **Shares code** with students
4. **Students join:**
   - Enter: Full Name, Class, Attendance Number
   - Select: Player role
   - Join with room code "ABC123"

5. **Admin monitors** in real-time:
   - See all joined players in table
   - View scores as they're updated
   - Check performance by difficulty

6. **Ends game** when complete
   - Results stored for analytics
   - Players view final leaderboard

## Security Notes

### Current Implementation (MVP)
- Session-based, browser-local storage
- Admin password hardcoded (`admin123`)
- No persistent database by default

### Production Recommendations
- Implement proper authentication (Supabase Auth)
- Store questions in database (Supabase)
- Encrypt admin credentials
- Add role-based access control (RBAC)
- Implement audit logging
- Add question versioning

## API Endpoints

### AI Question Generation
```
POST /api/admin/generate-questions
Content-Type: application/json

{
  "topic": "Arithmetic",
  "difficulty": "easy",
  "count": 5
}

Response: Array of Question objects
```

## File Structure

```
/app/admin/
  /dashboard/page.tsx      # Main admin panel
  /questions/page.tsx      # Question management
  /create-room/page.tsx    # Room creation
  /analytics/page.tsx      # Analytics dashboard

/api/admin/
  /generate-questions/route.ts  # AI generation endpoint
```

## Room Code Generation

- **Format:** 6 random uppercase alphanumeric characters
- **Example:** ABC123, XYZ789, DEF456
- **Uniqueness:** Verified at room creation time
- **Sharing:** Easy to read and communicate verbally

## Player Data Display Example

| Full Name | Class | Attendance # | Score | Status | Joined |
|-----------|-------|--------------|-------|--------|--------|
| Ahmad Rahman | 10A | 5 | 850 | active | 14:23:15 |
| Siti Nurhaliza | 10A | 12 | 920 | completed | 14:22:30 |
| Budi Santoso | 10B | 8 | 0 | idle | 14:25:00 |

## Testing the Admin System

1. **Start the app:**
   ```bash
   pnpm dev
   ```

2. **Open:** http://localhost:3000

3. **Select Admin role** at entry page

4. **Enter credentials:**
   - Full Name: "Test Admin"
   - Class: "School A"
   - Password: "admin123"

5. **Access admin features:**
   - Create rooms
   - Manage questions
   - Generate with AI
   - View analytics

## Troubleshooting

### Admin Login Failed
- Verify password is exactly: `admin123`
- Check Full Name and Class are not empty

### Questions Not Generating
- Check network connection
- Verify parameters (topic, difficulty, count)
- Try with fewer questions (max 20)

### Room Code Not Displaying
- Refresh the page
- Try creating a new room
- Clear browser cache

## Future Enhancements

- [ ] Import questions from CSV/Excel/Word
- [ ] Advanced question filtering
- [ ] Bulk question upload
- [ ] Custom grading rules
- [ ] Student performance reports
- [ ] Export analytics data
- [ ] Question difficulty auto-calibration
- [ ] Multi-language support
- [ ] Role-based permissions
- [ ] Audit logs

## Support

For issues or questions about the admin system, refer to the main README.md or contact support.
