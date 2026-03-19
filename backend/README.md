# Life Manager — Backend API

Complete Node.js/Express/TypeScript backend for the Life Manager Dashboard frontend.

---

## 🚀 Quick Start (5 minutes)

### 1. Place the `backend/` folder next to your frontend

```
your-project/
├── frontend/          ← your existing Vite/React project
└── backend/           ← this folder
```

### 2. Install dependencies

```bash
cd backend
npm install
```

### 3. Configure environment

```bash
cp .env.example .env   # or edit the included .env
```

Edit `.env` — the only required change for production is **JWT_SECRET**:
```
DATABASE_URL="file:./dev.db"
JWT_SECRET=change-this-to-a-long-random-string
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### 4. Set up the database and seed demo data

```bash
npm run db:generate    # generate Prisma client
npm run db:push        # create tables from schema
npm run db:seed        # load demo user + sample data
```

### 5. Start the server

```bash
npm run dev            # development (auto-reload)
npm run build && npm start  # production
```

The API is now running at **http://localhost:5000**

---

## 🔗 Connect the Frontend

Copy `src/utils/api-client.ts` into your frontend's `src/lib/` folder.

Add to your frontend `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

Example usage in any component:
```ts
import { api, setToken } from './lib/api';

// Login
const { token, user } = await api.auth.login('alex@example.com', 'password123');
setToken(token);  // saved to localStorage automatically

// Load dashboard
const dashboard = await api.dashboard.get();

// Toggle a task
await api.tasks.toggle(taskId);

// Log a habit
await api.habits.log(habitId);

// Log a meal
await api.meals.create({ name: 'Grilled Chicken', mealType: 'LUNCH', calories: 420, proteinG: 45 });
```

---

## 📡 Full API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, get JWT token |
| GET  | `/api/auth/me` | Get current user (auth required) |
| POST | `/api/auth/refresh` | Refresh token |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/users/profile` | Get profile |
| PATCH  | `/api/users/profile` | Update profile, calorie/step goals |
| POST   | `/api/users/change-password` | Change password |
| DELETE | `/api/users/account` | Delete account |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | All data for the main dashboard in one call |

Returns: user info, today's tasks, habits with streaks, nutrition summary, workouts, reminders, life performance score, and 7-day calorie chart.

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/tasks` | All tasks (filter: status, priority, date, search) |
| GET    | `/api/tasks/today` | Today's tasks with completion summary |
| GET    | `/api/tasks/:id` | Single task |
| POST   | `/api/tasks` | Create task |
| PATCH  | `/api/tasks/:id` | Update task |
| PATCH  | `/api/tasks/:id/toggle` | Toggle complete/pending |
| DELETE | `/api/tasks/:id` | Delete task |
| DELETE | `/api/tasks/bulk/completed` | Clear all completed tasks |

**Task fields:** `title`, `description`, `priority` (LOW/MEDIUM/HIGH/URGENT), `status` (PENDING/IN_PROGRESS/COMPLETED/CANCELLED), `dueDate`, `dueTime`, `tags`

### Habits

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/habits` | All habits with streaks |
| GET    | `/api/habits/today` | Today's habits with completion status |
| GET    | `/api/habits/:id` | Single habit with 90-day logs |
| POST   | `/api/habits` | Create habit |
| PATCH  | `/api/habits/:id` | Update habit |
| DELETE | `/api/habits/:id` | Delete habit |
| POST   | `/api/habits/:id/log` | Mark habit done (body: `{ date?, note? }`) |
| DELETE | `/api/habits/:id/log` | Unmark habit (query: `?date=YYYY-MM-DD`) |

Streaks are automatically calculated on every request.

### Workouts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/workouts` | All workouts (filter: type, startDate, endDate) |
| GET    | `/api/workouts/summary` | Aggregated stats (period: week/month/year) |
| GET    | `/api/workouts/:id` | Single workout |
| POST   | `/api/workouts` | Log workout |
| PATCH  | `/api/workouts/:id` | Update workout |
| DELETE | `/api/workouts/:id` | Delete workout |

**Workout types:** CARDIO, STRENGTH, YOGA, HIIT, SWIMMING, CYCLING, RUNNING, WALKING, SPORTS, OTHER

### Meals

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/meals` | All meals (filter: date, mealType) |
| GET    | `/api/meals/today` | Today's meals + full nutrition breakdown |
| GET    | `/api/meals/:id` | Single meal |
| POST   | `/api/meals` | Log meal |
| PATCH  | `/api/meals/:id` | Update meal |
| DELETE | `/api/meals/:id` | Delete meal |

**Meal types:** BREAKFAST, LUNCH, DINNER, SNACK, PRE_WORKOUT, POST_WORKOUT

### Reminders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/reminders` | All reminders |
| POST   | `/api/reminders` | Create reminder |
| PATCH  | `/api/reminders/:id` | Update reminder |
| PATCH  | `/api/reminders/:id/toggle` | Enable/disable |
| DELETE | `/api/reminders/:id` | Delete reminder |

**Days format:** Comma-separated — `"MON,TUE,WED,THU,FRI"` or `"MON,WED,FRI,SAT,SUN"`

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/overview` | High-level stats (period: week/month/year) |
| GET | `/api/analytics/tasks-chart` | Daily task completion chart (days=30) |
| GET | `/api/analytics/habits-chart` | Daily habit consistency chart |
| GET | `/api/analytics/calories-chart` | Daily calorie in/out chart |
| GET | `/api/analytics/workout-chart` | Daily workout minutes + calories |
| GET | `/api/analytics/timeline` | Full history for any date (`?date=YYYY-MM-DD`) |
| GET | `/api/analytics/life-score-trend` | Life performance score trend (days=30) |

---

## 🗃️ Database

SQLite by default (zero setup). To use **PostgreSQL**:

1. Update `.env`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/life_manager"
   ```
2. Run:
   ```bash
   npm run db:migrate
   ```

Schema is in `prisma/schema.prisma`. To explore data visually:
```bash
npm run db:studio
```

---

## 🔒 Security

- All `/api/*` routes except `/api/auth/*` require a `Authorization: Bearer <token>` header
- Rate limiting: 200 req/15min globally, 10 req/15min on auth routes
- Passwords hashed with bcrypt (12 rounds)
- Helmet.js for HTTP security headers
- Per-user data isolation — users can only access their own records

---

## 📁 Project Structure

```
backend/
├── prisma/
│   └── schema.prisma        ← Database models
├── src/
│   ├── index.ts             ← Express server entry point
│   ├── middleware/
│   │   ├── auth.ts          ← JWT authentication
│   │   ├── errorHandler.ts  ← Global error handling
│   │   └── validate.ts      ← Request validation helper
│   ├── routes/
│   │   ├── auth.ts          ← Register, login, token refresh
│   │   ├── users.ts         ← Profile management
│   │   ├── dashboard.ts     ← Aggregated dashboard data
│   │   ├── tasks.ts         ← Task CRUD + toggle
│   │   ├── habits.ts        ← Habit CRUD + logging + streaks
│   │   ├── workouts.ts      ← Workout logging + summary
│   │   ├── meals.ts         ← Meal logging + nutrition
│   │   ├── reminders.ts     ← Reminder management
│   │   └── analytics.ts     ← Charts, timeline, trend data
│   └── utils/
│       ├── seed.ts          ← Demo data seeder
│       └── api-client.ts    ← Copy to frontend src/lib/
├── .env                     ← Environment config
├── package.json
└── tsconfig.json
```

---

## 🧪 Demo Credentials

After running `npm run db:seed`:

- **Email:** alex@example.com  
- **Password:** password123
