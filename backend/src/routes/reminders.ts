import { Router, Request, Response } from 'express';
import { prisma, USER_ID } from '../index';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const reminders = await prisma.reminder.findMany({ where: { userId: USER_ID }, orderBy: { time: 'asc' } });
    res.json({ reminders });
  } catch(e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, description, type, time, days } = req.body;
    if (!title || !time || !days) { res.status(400).json({ error: 'title, time and days required' }); return; }
    const reminder = await prisma.reminder.create({ data: { userId: USER_ID, title, description, type: type||'CUSTOM', time, days } });
    res.status(201).json({ reminder });
  } catch(e: any) { res.status(500).json({ error: e.message }); }
});

router.patch('/:id/toggle', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.reminder.findFirst({ where: { id: req.params.id, userId: USER_ID } });
    if (!existing) { res.status(404).json({ error: 'Not found' }); return; }
    const reminder = await prisma.reminder.update({ where: { id: req.params.id }, data: { isActive: !existing.isActive } });
    res.json({ reminder });
  } catch(e: any) { res.status(500).json({ error: e.message }); }
});

router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.reminder.findFirst({ where: { id: req.params.id, userId: USER_ID } });
    if (!existing) { res.status(404).json({ error: 'Not found' }); return; }
    const reminder = await prisma.reminder.update({ where: { id: req.params.id }, data: req.body });
    res.json({ reminder });
  } catch(e: any) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.reminder.deleteMany({ where: { id: req.params.id, userId: USER_ID } });
    res.json({ message: 'Deleted' });
  } catch(e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
