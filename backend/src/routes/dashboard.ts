import { Router, Request, Response } from 'express';
import { prisma, USER_ID } from '../index';

const router = Router();
const fmt = (d: Date) => d.toISOString().split('T')[0];

const calcStreak = async (habitId: string): Promise<number> => {
  const logs = await prisma.habitLog.findMany({ where: { habitId }, orderBy: { date: 'desc' }, take: 60 });
  if (!logs.length) return 0;
  const dates = new Set(logs.map(l => l.date));
  const today = new Date(); today.setHours(0,0,0,0);
  const check = new Date(today);
  if (!dates.has(fmt(today))) {
    const y = new Date(today); y.setDate(y.getDate()-1);
    if (!dates.has(fmt(y))) return 0;
    check.setDate(check.getDate()-1);
  }
  let s = 0;
  while (dates.has(fmt(check))) { s++; check.setDate(check.getDate()-1); }
  return s;
};

router.get('/', async (_req: Request, res: Response) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
    const todayStr = fmt(today);

    const user = await prisma.user.findUnique({ where: { id: USER_ID }, select: { displayName: true, avatarSeed: true, dailyCalorieGoal: true } });

    // Tasks
    const tasks = await prisma.task.findMany({ where: { userId: USER_ID }, orderBy: { createdAt: 'desc' }, take: 8 });
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;

    // Habits
    const habits = await prisma.habit.findMany({ where: { userId: USER_ID, isActive: true }, include: { logs: { where: { date: todayStr } } } });
    const habitsWithMeta = await Promise.all(habits.map(async h => ({ id: h.id, name: h.name, icon: h.icon, color: h.color, completedToday: h.logs.length > 0, streak: await calcStreak(h.id) })));
    const completedHabits = habitsWithMeta.filter(h => h.completedToday).length;

    // Meals today
    const meals = await prisma.meal.findMany({ where: { userId: USER_ID, loggedAt: { gte: today, lt: tomorrow } } });
    const totalCalories = meals.reduce((s,m) => s+m.calories, 0);
    const calorieGoal = user?.dailyCalorieGoal || 2000;

    // Workouts today
    const workouts = await prisma.workout.findMany({ where: { userId: USER_ID, loggedAt: { gte: today, lt: tomorrow } } });
    const caloriesBurned = workouts.reduce((s,w) => s+w.caloriesBurned, 0);

    // 7-day calorie chart
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate()-i);
      const n = new Date(d); n.setDate(n.getDate()+1);
      const dayMeals = await prisma.meal.findMany({ where: { userId: USER_ID, loggedAt: { gte: d, lt: n } } });
      chartData.push({ day: days[d.getDay()], value: dayMeals.reduce((s,m) => s+m.calories, 0) });
    }

    // Life score
    const taskScore = tasks.length > 0 ? (completedTasks/tasks.length)*30 : 15;
    const habitScore = habits.length > 0 ? (completedHabits/habits.length)*30 : 15;
    const calScore = totalCalories > 0 ? Math.max(0, 20 - Math.abs(totalCalories - calorieGoal)/calorieGoal*20) : 10;
    const workoutScore = Math.min(20, (workouts.reduce((s,w)=>s+w.durationMins,0)/30)*20);
    const lifeScore = Math.round(taskScore + habitScore + calScore + workoutScore);

    res.json({
      user: user || { displayName: 'Alex Johnson', avatarSeed: 'Alex', dailyCalorieGoal: 2000 },
      today: todayStr,
      lifePerformanceScore: lifeScore,
      tasks: { items: tasks, total: tasks.length, completed: completedTasks, completionRate: tasks.length > 0 ? Math.round((completedTasks/tasks.length)*100) : 0 },
      habits: { items: habitsWithMeta, total: habits.length, completed: completedHabits, completionRate: habits.length > 0 ? Math.round((completedHabits/habits.length)*100) : 0 },
      nutrition: { todayMeals: meals, totalCaloriesConsumed: totalCalories, calorieGoal, caloriesRemaining: Math.max(0, calorieGoal-totalCalories), weeklyCalorieChart: chartData },
      fitness: { todayWorkouts: workouts, caloriesBurned, workoutMinutes: workouts.reduce((s,w)=>s+w.durationMins,0) },
    });
  } catch(e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
