import { Router, Request, Response } from 'express';
import { prisma, USER_ID } from '../index';

const router = Router();
const fmt = (d: Date) => d.toISOString().split('T')[0];

router.get('/overview', async (_req: Request, res: Response) => {
  try {
    const start = new Date(); start.setDate(start.getDate()-7);
    const [tasks, workouts, meals] = await Promise.all([
      prisma.task.findMany({ where: { userId: USER_ID, createdAt: { gte: start } } }),
      prisma.workout.findMany({ where: { userId: USER_ID, loggedAt: { gte: start } } }),
      prisma.meal.findMany({ where: { userId: USER_ID, loggedAt: { gte: start } } }),
    ]);
    const completed = tasks.filter(t => t.status === 'COMPLETED').length;
    res.json({ overview: {
      tasks: { total: tasks.length, completed, rate: tasks.length > 0 ? Math.round((completed/tasks.length)*100) : 0 },
      fitness: { totalWorkouts: workouts.length, totalMinutes: workouts.reduce((s,w)=>s+w.durationMins,0), totalCaloriesBurned: workouts.reduce((s,w)=>s+w.caloriesBurned,0) },
      nutrition: { totalCalories: meals.reduce((s,m)=>s+m.calories,0), totalMeals: meals.length },
    }});
  } catch(e: any) { res.status(500).json({ error: e.message }); }
});

router.get('/timeline', async (req: Request, res: Response) => {
  try {
    const { date } = req.query as { date?: string };
    const target = date ? new Date(date) : new Date();
    target.setHours(0,0,0,0);
    const next = new Date(target); next.setDate(next.getDate()+1);
    const dateStr = fmt(target);

    const [tasks, habitLogs, workouts, meals] = await Promise.all([
      prisma.task.findMany({ where: { userId: USER_ID, createdAt: { gte: target, lt: next } } }),
      prisma.habitLog.findMany({ where: { userId: USER_ID, date: dateStr }, include: { habit: { select: { name: true, icon: true, color: true } } } }),
      prisma.workout.findMany({ where: { userId: USER_ID, loggedAt: { gte: target, lt: next } } }),
      prisma.meal.findMany({ where: { userId: USER_ID, loggedAt: { gte: target, lt: next } } }),
    ]);

    res.json({ date: dateStr, tasks, habits: habitLogs, workouts, meals,
      summary: {
        tasksCompleted: tasks.filter(t=>t.status==='COMPLETED').length,
        habitsCompleted: habitLogs.length,
        totalCalories: meals.reduce((s,m)=>s+m.calories,0),
        workoutMinutes: workouts.reduce((s,w)=>s+w.durationMins,0),
      }
    });
  } catch(e: any) { res.status(500).json({ error: e.message }); }
});

router.get('/life-score-trend', async (_req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: USER_ID }, select: { dailyCalorieGoal: true } });
    const goal = user?.dailyCalorieGoal || 2000;
    const trend = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate()-i); d.setHours(0,0,0,0);
      const n = new Date(d); n.setDate(n.getDate()+1);
      const dateStr = fmt(d);
      const [tasks, logs, workouts, meals, habitCount] = await Promise.all([
        prisma.task.findMany({ where: { userId: USER_ID, createdAt: { gte: d, lt: n } }, select: { status: true } }),
        prisma.habitLog.count({ where: { userId: USER_ID, date: dateStr } }),
        prisma.workout.findMany({ where: { userId: USER_ID, loggedAt: { gte: d, lt: n } }, select: { durationMins: true } }),
        prisma.meal.findMany({ where: { userId: USER_ID, loggedAt: { gte: d, lt: n } }, select: { calories: true } }),
        prisma.habit.count({ where: { userId: USER_ID, isActive: true } }),
      ]);
      const cals = meals.reduce((s,m)=>s+m.calories,0);
      const mins = workouts.reduce((s,w)=>s+w.durationMins,0);
      const comp = tasks.filter(t=>t.status==='COMPLETED').length;
      const score = Math.round(
        (tasks.length>0?(comp/tasks.length)*30:0) +
        (habitCount>0?(logs/habitCount)*30:0) +
        (cals>0?Math.max(0,20-Math.abs(cals-goal)/goal*20):0) +
        Math.min(20,(mins/30)*20)
      );
      trend.push({ date: dateStr, score });
    }
    res.json({ trend });
  } catch(e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
