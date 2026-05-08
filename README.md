# Math Battle Arena - Setup Guide

## Overview
Math Battle Arena is a real-time multiplayer math quiz game built with Next.js and Socket.io. Players enter their name and class to create a session, then compete in solo or multiplayer modes with tiered difficulty levels (Easy, Medium, Hard). **No authentication required - just fill in your name and class to start playing!**

## Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Run Development Server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## How to Use

1. **Entry Page**: Enter your name and class to start
2. **Dashboard**: Select a game mode (Solo or Multiplayer)
3. **Select Difficulty**: Choose Easy, Medium, or Hard
4. **Play**: Answer 10 math questions in 30 seconds each
5. **Results**: See your score and replay or exit

## Project Structure

```
/app
  /entry                 # Entry page (name & class form)
  /dashboard            # Main dashboard page
  /game
    /solo              # Solo game mode
    /multiplayer       # Multiplayer game mode
  /leaderboard          # Session leaderboard

/lib
  session-context.tsx   # Session state management
  types.ts              # Type definitions
  api.ts                # Game API utilities
  socket-server.ts      # Socket.io server logic
  socket-client.ts      # Socket.io client logic

/scripts
  01_create_schema.sql  # Database schema (if using DB)
  02_seed_questions.sql # Math questions seed data
```

## Features

### Entry System
- Simple form-based entry (no registration)
- Requires: Name and Class fields
- Generates unique session ID
- Session stored in sessionStorage (cleared on browser close)

### Game Modes
1. **Solo Mode**
   - 10 questions per round
   - 30 seconds per question
   - Difficulty selection (Easy/Medium/Hard)
   - Real-time scoring and streaks
   - Question progression

2. **Multiplayer Mode** (Ready for Socket.io)
   - Up to 36 players per room
   - Real-time leaderboard
   - Synchronized question delivery
   - Instant results

### Difficulty Levels
- **Easy**: Single digit math (+, -, ×, ÷)
- **Medium**: Double digit math operations
- **Hard**: Triple digit math operations

### User Interface
- Clean, centered card design
- Full light and dark mode support
- Smooth animations and transitions
- Responsive on all screen sizes

## Session Management

### Data Stored in Session
- Player Name
- Class
- Session ID (UUID)
- Game responses (if using database)

### Data Persistence
- Session data stored in `sessionStorage`
- Cleared when browser tab is closed
- No persistent data on server by default
- Optional Supabase integration for game history

## Theme & Styling

The app uses a dark gaming-focused theme with:
- **Primary Color**: Orange (for important actions)
- **Accent Color**: Bright Green (for highlights)
- **Secondary Color**: Blue (for secondary elements)
- **Background**: Deep dark color for reduced eye strain

Full support for system light/dark mode detection.

## Database Integration (Optional)

To enable game history and leaderboards:

1. Set up Supabase project
2. Add environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Run migration scripts in Supabase SQL editor:
   - `scripts/01_create_schema.sql`
   - `scripts/02_seed_questions.sql`

## Real-Time Features (Socket.io)

Socket.io infrastructure is fully implemented for multiplayer functionality:
- Room management (join/leave)
- Game start coordination
- Answer submission
- Score updates
- Game completion

## Performance Notes
- Light-weight session-based system
- No authentication overhead
- Client-side state management
- Efficient question delivery
- Optimized for quick start and play

## Troubleshooting

### Entry Page Not Loading
- Clear browser cache
- Check that all node_modules are installed (`pnpm install`)

### Games Not Starting
- Verify sessionStorage is enabled in browser
- Check browser console for errors
- Ensure JavaScript is enabled

### UI Styling Issues
- Make sure Tailwind CSS is properly built
- Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

## Testing

### Quick Test Flow
1. Go to http://localhost:3000
2. Redirected to entry page
3. Enter any name (e.g., "Player1") and class (e.g., "10A")
4. Click "Start Battle"
5. Select difficulty and game mode
6. Play solo game
7. View results

## Deployment

### Vercel Deployment
1. Push code to GitHub
2. Connect repository to Vercel
3. Deploy (no environment variables required for basic functionality)

### With Database (Optional)
1. Set up Supabase project
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel
3. Run database migrations in Supabase

## Future Enhancements
- [ ] Multiplayer rooms and matchmaking
- [ ] Persistent leaderboards (Supabase)
- [ ] Chat and trash talk during games
- [ ] Custom question creation
- [ ] Power-ups and bonuses
- [ ] Mobile app version
- [ ] Sound effects and notifications
- [ ] Daily/weekly challenges
- [ ] Achievement system
- [ ] Anti-cheat measures

## Support
For issues, check the Next.js documentation or Socket.io guides.
