import { Router, Request, Response } from 'express';
import { prisma, USER_ID } from '../index';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { type } = req.query as Record<string,string>;
    const where: any = { userId: USER_ID };
    if (type) where.type = type;
    const workouts = await prisma.workout.findMany({ where, orderBy: { loggedAt: 'desc' } });
    res.json({ workouts });
  } catch(e: any) { res.status(500).json({ error: e.message }); }
});

router.get('/summary', async (_req: Request, res: Response) => {
  try {
    const start = new Date(); start.setDate(start.getDate()-7);
    const workouts = await prisma.workout.findMany({ where: { userId: USER_ID, loggedAt: { gte: start } } });
    res.json({ summary: {
      totalWorkouts: workouts.length,
      totalCaloriesBurned: workouts.reduce((s,w) => s+w.caloriesBurned, 0),
      totalMinutes: workouts.reduce((s,w) => s+w.durationMins, 0),
    }});
  } catch(e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, type, durationMins, caloriesBurned, sets, reps, weightKg, distanceKm, notes, loggedAt } = req.body;
    if (!name || !durationMins) { res.status(400).json({ error: 'name and durationMins required' }); return; }
    const workout = await prisma.workout.create({ data: {
      userId: USER_ID, name, type: type||'OTHER', durationMins, caloriesBurned: caloriesBurned||0,
      sets, reps, weightKg, distanceKm, notes, loggedAt: loggedAt ? new Date(loggedAt) : new Date(),
    }});
    res.status(201).json({ workout });
  } catch(e: any) { res.status(500).json({ error: e.message }); }
});

router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.workout.findFirst({ where: { id: req.params.id, userId: USER_ID } });
    if (!existing) { res.status(404).json({ error: 'Not found' }); return; }
    const workout = await prisma.workout.update({ where: { id: req.params.id }, data: req.body });
    res.json({ workout });
  } catch(e: any) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.workout.deleteMany({ where: { id: req.params.id, userId: USER_ID } });
    res.json({ message: 'Deleted' });
  } catch(e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
