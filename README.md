# 🎯 Life Manager — Personal Growth Platform

> A complete personal life-management web app built with React + TypeScript. Track tasks, habits, fitness, diet, and custom counters — all in one place, with no backend required.

**Live Demo → [life-manager-2dli.onrender.com](https://life-manager-2dli.onrender.com)**

![Life Manager Dashboard](https://img.shields.io/badge/Status-Live-brightgreen) ![React](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-4.0-06B6D4) ![Deployed on Render](https://img.shields.io/badge/Deployed%20on-Render-purple)

---

## 📸 Screenshots

| Dashboard | Habits | Fitness | Tap Counter |
|---|---|---|---|
| Life score, tasks, habits overview | Streaks, categories, daily goals | Workouts, meals, macros | Custom tap counters with history |

---

## ✨ Features

### 📋 Task Manager
- Create, complete, and delete tasks
- Priority levels — LOW, MEDIUM, HIGH, URGENT
- Daily progress bar with completion rate
- Persistent across sessions

### 🔥 Habit Tracker
- Daily habit logging with streak calculation
- Categories — Health, Fitness, Mindset, Learning
- Custom emoji and color per habit
- Streak history and consistency insights

### 💪 Fitness Hub
- Log workouts with type, duration, calories burned
- Weekly activity chart
- Meal logging with full macro breakdown (protein, carbs, fat)
- Daily calorie goal vs consumed tracker

### 🎯 Tap Counter
- Create unlimited custom counters
- Track anything — water glasses, medicine, steps, cigarettes
- Daily goal with progress ring
- 7-day history chart per counter
- Haptic feedback on mobile

### 📊 Analytics
- Life performance score (0–100) calculated in real time
- Weekly life score trend chart
- Task completion rate
- Habit consistency rate
- Workout frequency and minutes

### 📱 Mobile Ready
- Fully responsive — works on all screen sizes
- Bottom navigation bar on mobile
- Touch-friendly tap targets
- PWA-ready (add to home screen)

---

## 🚀 Tech Stack

| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| TypeScript | Type safety |
| Tailwind CSS 4 | Styling |
| Vite 6 | Build tool |
| Recharts | Charts and graphs |
| Lucide React | Icons |
| Framer Motion | Animations |
| localStorage | Data persistence |

---

## 🛠️ Run Locally

```bash
# Clone the repo
git clone https://github.com/AadityaMenkudale/life-manager.git

# Navigate to folder
cd life-manager

# Install dependencies
npm install

# Start development server
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## 📦 Build for Production

```bash
npm run build
```

Output goes to the `dist/` folder. Deploy anywhere — Render, Vercel, Netlify, GitHub Pages.

---

## 🗂️ Project Structure

```
life-manager/
├── src/
│   ├── components/
│   │   ├── Sidebar.tsx        # Navigation (desktop + mobile)
│   │   └── TapCounter.tsx     # Tap counter feature
│   ├── App.tsx                # Main app — all views and state
│   ├── types.ts               # TypeScript types
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles
├── index.html
├── vite.config.ts
├── package.json
└── tsconfig.json
```

---

## 💾 Data Storage

All data is stored in **localStorage** — no backend, no login, no server needed.

| Key | Data |
|---|---|
| `lm_tasks` | All tasks |
| `lm_habits` | All habits + streaks |
| `lm_workouts` | Workout logs |
| `lm_meals` | Meal logs |
| `lm_counters` | Tap counter data |

Data persists across browser sessions and page refreshes. Clears only if browser storage is manually cleared.

---

## 🗺️ Roadmap

- [ ] Google / email login
- [ ] Cloud sync across devices (Supabase)
- [ ] AI daily coaching insights
- [ ] Freemium subscription model
- [ ] Android / iOS app (Capacitor)
- [ ] Reminders and push notifications
- [ ] Weight and sleep tracker
- [ ] Social features and challenges
- [ ] Export data as CSV / PDF

---

## 👨‍💻 Built By

**Aadi Menkudale**
- GitHub: [@AadityaMenkudale](https://github.com/AadityaMenkudale)
- Live: [life-manager-2dli.onrender.com](https://life-manager-2dli.onrender.com)

---

## 📄 License

MIT License — free to use, modify and distribute.

---

> Built from scratch using React + TypeScript. No templates, no UI libraries — just clean code and a vision for a better personal growth app.
