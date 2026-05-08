# Quick Start - Admin System

## Getting Started with Admin Features

### 1. Start the Application
```bash
pnpm dev
```

Open http://localhost:3000

### 2. Access Admin Panel

**Step 1:** Go to Entry Page
- Home page automatically redirects to `/entry`

**Step 2:** Select Admin Role
- Click the "Admin" card on the role selection screen

**Step 3:** Login as Admin
- **Full Name:** (any name, e.g., "Test Admin")
- **Class:** (any class, e.g., "School A")
- **Admin Password:** `admin123`

**Step 4:** Access Admin Dashboard
- Automatically redirected to `/admin/dashboard`

---

## Admin Features Overview

### Admin Dashboard (`/admin/dashboard`)
- View active players
- Quick stats (players, games, questions)
- Access to all admin tools

### Create Game Room (`/admin/create-room`)
- Set difficulty level
- Configure max players
- Generate room code
- Share with students

### Manage Questions (`/admin/questions`)
- View question bank
- Generate questions with AI
- Import questions (UI ready)
- Delete questions

### Analytics (`/admin/analytics`)
- View player statistics
- Performance by difficulty
- Top players leaderboard
- Game completion stats

---

## Testing Admin Features

### Test 1: Create a Game Room

1. **Admin Dashboard** → "Create Game Room"
2. **Configure:**
   - Difficulty: Medium
   - Max Players: 15
3. **Click:** "Create Room"
4. **Result:** Room code displays (e.g., "ABC123")
5. **Action:** Copy the room code

### Test 2: Generate AI Questions

1. **Admin Dashboard** → "Manage Questions"
2. **Click:** "Generate with AI" tab
3. **Configure:**
   - Topic: "Arithmetic"
   - Difficulty: "Easy"
   - Questions: 5
4. **Click:** "Generate Questions"
5. **Result:** 5 questions added to bank

### Test 3: Monitor Players

1. **Admin Dashboard** → Scroll to "Connected Players" table
2. **Currently:** No players (would show when players join)
3. **Will display:** Name, Class, Attendance #, Score, Status

### Test 4: View Analytics

1. **Admin Dashboard** → "View Analytics"
2. **See:**
   - Total players (this session)
   - Games completed
   - Average score
   - Success rate

---

## Admin User Roles & Permissions

| Feature | Admin | Player |
|---------|-------|--------|
| View Dashboard | ✓ | ✓ |
| Create Rooms | ✓ | ✗ |
| Manage Questions | ✓ | ✗ |
| Generate Questions | ✓ | ✗ |
| View Analytics | ✓ | ✗ |
| Play Games | ✗ | ✓ |
| Join with Room Code | ✗ | ✓ |
| View Leaderboard | ✓ | ✓ |

---

## Player Testing (For Comparison)

### Player Entry Flow

1. **Go to:** http://localhost:3000/entry
2. **Select:** "Player" role
3. **Enter:**
   - **Full Name:** "Ahmad Rahman"
   - **Class:** "10A"
   - **Attendance Number:** "5"
4. **Click:** "Start Battle"
5. **Redirected to:** Player Dashboard (`/dashboard`)

### Player Dashboard Features

- Select difficulty
- Choose game mode (Solo/Multiplayer)
- View session info
- Play games

---

## Admin System Architecture

```
Entry Page
├── Admin Role Selected
│   ├── Admin Dashboard
│   │   ├── Create Room → Room Code Generated
│   │   ├── Manage Questions
│   │   │   ├── View Questions
│   │   │   ├── Generate with AI
│   │   │   └── Import (Coming Soon)
│   │   └── Analytics
│   └── Player Monitoring Table
│
└── Player Role Selected
    ├── Player Dashboard
    │   ├── Solo Mode
    │   └── Multiplayer (uses Admin-created room code)
    └── Game Session
```

---

## Room Code System

### How Room Codes Work

1. **Admin creates room** with difficulty setting
2. **System generates** 6-character code (e.g., "ABC123")
3. **Admin shares** code with players
4. **Players use** code to join specific room
5. **Game session** groups players in same room

### Example Room Code
- Format: 6 uppercase alphanumeric characters
- Examples: XYZ789, ABC123, DEF456
- Unique per room
- Easy to communicate verbally

---

## API Endpoints

### Generate Questions
```bash
POST /api/admin/generate-questions
Content-Type: application/json

{
  "topic": "Arithmetic",
  "difficulty": "easy",
  "count": 5
}
```

**Response:**
```json
[
  {
    "id": "gen_1234567890_0",
    "question": "12 + 8 = ?",
    "difficulty": "easy",
    "options": ["20", "18", "22", "16"],
    "correctAnswer": 0,
    "explanation": "12 + 8 = 20"
  }
]
```

---

## Troubleshooting

### Admin Password Incorrect
- **Solution:** Use exactly `admin123` (no spaces)

### Room Code Not Displaying
- **Solution:** Refresh page and try again
- **Check:** Browser console for errors

### Questions Not Generating
- **Solution:** Verify all parameters filled
- **Check:** Network tab in browser dev tools
- **Try:** Smaller count (1-5 instead of 20)

### Admin Routes Not Loading
- **Solution:** Clear browser cache
- **Check:** Dev server is running
- **Verify:** URL is `/admin/dashboard`

---

## Production Checklist

Before deploying to production:

- [ ] Change admin password (`admin123`)
- [ ] Implement proper authentication (Supabase)
- [ ] Add database for questions (Supabase)
- [ ] Implement role-based access control
- [ ] Add audit logging
- [ ] Test all admin features
- [ ] Configure WebSockets for real-time updates
- [ ] Set up error monitoring
- [ ] Add rate limiting
- [ ] Create admin user management

---

## File Locations

```
Admin Pages:
/app/admin/dashboard/page.tsx
/app/admin/questions/page.tsx
/app/admin/create-room/page.tsx
/app/admin/analytics/page.tsx

Admin API:
/app/api/admin/generate-questions/route.ts

Session Management:
/lib/session-context.tsx

Entry Point:
/app/entry/page.tsx

Documentation:
/ADMIN_SYSTEM.md
/ADMIN_ENHANCEMENTS.md
```

---

## Next Features

Coming Soon:
- [ ] CSV/Excel/Word question import
- [ ] Real-time WebSocket updates
- [ ] Database persistence
- [ ] Advanced filtering
- [ ] Report generation
- [ ] Multi-language support
- [ ] Custom grading rules
- [ ] Achievement system

---

For more details, see `ADMIN_SYSTEM.md` and `ADMIN_ENHANCEMENTS.md`
