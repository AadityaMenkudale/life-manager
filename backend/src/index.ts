import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

import taskRoutes from './routes/tasks';
import habitRoutes from './routes/habits';
import workoutRoutes from './routes/workouts';
import mealRoutes from './routes/meals';
import reminderRoutes from './routes/reminders';
import analyticsRoutes from './routes/analytics';
import dashboardRoutes from './routes/dashboard';

dotenv.config();

export const prisma = new PrismaClient();

// Fixed user ID - no login needed, single user app
export const USER_ID = 'default-user';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/tasks', taskRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

app.listen(PORT, () => {
  console.log(`\n🚀 Life Manager API running on http://localhost:${PORT}\n`);
});

export default app;
