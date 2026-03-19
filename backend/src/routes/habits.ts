import { Router, Request, Response } from 'express';
import { prisma, USER_ID } from '../index';

const router = Router();

const formatDate = (d: Date) => d.toISOString().split('T')[0];

const calcStreak = async (habitId: string): Promise<number> => {
  const logs = await prisma.habitLog.findMany({ where: { habitId }, orderBy: { date: 'desc' }, take: 60 });
  if (!logs.length) return 0;
  const dates = new Set(logs.map(l => l.date));
  const today = new Date(); today.setHours(0,0,0,0);
  const check = new Date(today);
  if (!dates.has(formatDate(today))) {
    const yest = new Date(today); yest.setDate(yest.getDate()-1);
    if (!dates.has(formatDate(yest))) return 0;
    check.setDate(check.getDate()-1);
  }
  let streak = 0;
  while (dates.has(formatDate(check))) { streak++; check.setDate(check.getDate()-1); }
  return streak;
};

// GET /api/habits/today
router.get('/today', async (_req: Request, res: Response) => {
  try {
    const today = formatDate(new Date());
    const habits = await prisma.habit.findMany({ where: { userId: USER_ID, isActive: true }, include: { logs: { where: { date: today } } } });
    const result = await Promise.all(habits.map(async h => ({ ...h, streak: await calcStreak(h.id), completedToday: h.logs.length > 0 })));
    const completed = result.filter(h => h.completedToday).length;
    res.json({ habits: result, summary: { total: result.length, completed, completionRate: result.length > 0 ? Math.round((completed/result.length)*100) : 0 } });
  } catch(e: any) { res.status(500).json({ error: e.message }); }
});

// GET /api/habits
router.get('/', async (_req: Request, res: Response) => {
  try {
    const today = formatDate(new Date());
    const habits = await prisma.habit.findMany({ where: { userId: USER_ID }, include: { logs: { where: { date: today } } } });
    const result = await Promise.all(habits.map(async h => ({ ...h, streak: await calcStreak(h.id), completedToday: h.logs.length > 0 })));
    res.json({ habits: result });
  } catch(e: any) { res.status(500).json({ error: e.message }); }
});

// POST /api/habits
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, icon, color, category, frequency, reminderTime } = req.body;
    if (!name) { res.status(400).json({ error: 'Name required' }); return; }
    const habit = await prisma.habit.create({ data: { userId: USER_ID, name, description, icon: icon||'star', color: color||'blue', category: category||'HEALTH', frequency: frequency||'DAILY', reminderTime } });
    res.status(201).json({ habit: { ...habit, streak: 0, completedToday: false } });
  } catch(e: any) { res.status(500).json({ error: e.message }); }
});

// PATCH /api/habits/:id
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.habit.findFirst({ where: { id: req.params.id, userId: USER_ID } });
    if (!existing) { res.status(404).json({ error: 'Not found' }); return; }
    const { name, icon, color, category, isActive, reminderTime } = req.body;
    const habit = await prisma.habit.update({ where: { id: req.params.id }, data: {
      ...(name !== undefined && { name }), ...(icon !== undefined && { icon }),
      ...(color !== undefined && { color }), ...(category !== undefined && { category }),
      ...(isActive !== undefined && { isActive }), ...(reminderTime !== undefined && { reminderTime }),
    }});
    res.json({ habit });
  } catch(e: any) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/habits/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.habit.deleteMany({ where: { id: req.params.id, userId: USER_ID } });
    res.json({ message: 'Deleted' });
  } catch(e: any) { res.status(500).json({ error: e.message }); }
});

// POST /api/habits/:id/log  - mark done today
router.post('/:id/log', async (req: Request, res: Response) => {
  try {
    const habit = await prisma.habit.findFirst({ where: { id: req.params.id, userId: USER_ID } });
    if (!habit) { res.status(404).json({ error: 'Not found' }); return; }
    const date = req.body.date || formatDate(new Date());
    const log = await prisma.habitLog.upsert({
      where: { habitId_date: { habitId: req.params.id, date } },
      create: { habitId: req.params.id, userId: USER_ID, date },
      update: {},
    });
    const streak = await calcStreak(req.params.id);
    res.json({ log, streak });
  } catch(e: any) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/habits/:id/log  - unmark today
router.delete('/:id/log', async (req: Request, res: Response) => {
  try {
    const date = (req.query.date as string) || formatDate(new Date());
    await prisma.habitLog.deleteMany({ where: { habitId: req.params.id, userId: USER_ID, date } });
    res.json({ message: 'Unlogged' });
  } catch(e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
