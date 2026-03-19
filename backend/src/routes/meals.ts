import { Router, Request, Response } from 'express';
import { prisma, USER_ID } from '../index';

const router = Router();

router.get('/today', async (_req: Request, res: Response) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
    const user = await prisma.user.findUnique({ where: { id: USER_ID }, select: { dailyCalorieGoal: true } });
    const meals = await prisma.meal.findMany({ where: { userId: USER_ID, loggedAt: { gte: today, lt: tomorrow } }, orderBy: { loggedAt: 'asc' } });
    const totalCalories = meals.reduce((s,m) => s+m.calories, 0);
    const goal = user?.dailyCalorieGoal || 2000;
    res.json({ meals, nutrition: {
      totalCalories, calorieGoal: goal,
      caloriesRemaining: Math.max(0, goal-totalCalories),
      calorieProgress: Math.min(100, Math.round((totalCalories/goal)*100)),
      macros: {
        protein: Math.round(meals.reduce((s,m) => s+m.proteinG, 0)),
        carbs: Math.round(meals.reduce((s,m) => s+m.carbsG, 0)),
        fat: Math.round(meals.reduce((s,m) => s+m.fatG, 0)),
      }
    }});
  } catch(e: any) { res.status(500).json({ error: e.message }); }
});

router.get('/', async (_req: Request, res: Response) => {
  try {
    const meals = await prisma.meal.findMany({ where: { userId: USER_ID }, orderBy: { loggedAt: 'desc' } });
    res.json({ meals });
  } catch(e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, mealType, calories, proteinG, carbsG, fatG, servingSize, notes } = req.body;
    if (!name || calories === undefined) { res.status(400).json({ error: 'name and calories required' }); return; }
    const meal = await prisma.meal.create({ data: {
      userId: USER_ID, name, mealType: mealType||'SNACK', calories,
      proteinG: proteinG||0, carbsG: carbsG||0, fatG: fatG||0, servingSize, notes,
    }});
    res.status(201).json({ meal });
  } catch(e: any) { res.status(500).json({ error: e.message }); }
});

router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.meal.findFirst({ where: { id: req.params.id, userId: USER_ID } });
    if (!existing) { res.status(404).json({ error: 'Not found' }); return; }
    const meal = await prisma.meal.update({ where: { id: req.params.id }, data: req.body });
    res.json({ meal });
  } catch(e: any) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.meal.deleteMany({ where: { id: req.params.id, userId: USER_ID } });
    res.json({ message: 'Deleted' });
  } catch(e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
