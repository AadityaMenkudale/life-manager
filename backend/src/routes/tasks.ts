import { Router, Request, Response } from 'express';
import { prisma, USER_ID } from '../index';

const router = Router();

// GET /api/tasks/today
router.get('/today', async (_req: Request, res: Response) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
    const tasks = await prisma.task.findMany({
      where: { userId: USER_ID },
      orderBy: [{ createdAt: 'desc' }],
    });
    const completed = tasks.filter(t => t.status === 'COMPLETED').length;
    res.json({ tasks, summary: { total: tasks.length, completed, pending: tasks.length - completed, completionRate: tasks.length > 0 ? Math.round((completed/tasks.length)*100) : 0 } });
  } catch(e: any) { res.status(500).json({ error: e.message }); }
});

// GET /api/tasks
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, priority, search } = req.query as Record<string, string>;
    const where: any = { userId: USER_ID };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (search) where.title = { contains: search };
    const tasks = await prisma.task.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json({ tasks });
  } catch(e: any) { res.status(500).json({ error: e.message }); }
});

// POST /api/tasks
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, description, priority, dueDate, dueTime, tags } = req.body;
    if (!title) { res.status(400).json({ error: 'Title required' }); return; }
    const task = await prisma.task.create({ data: {
      userId: USER_ID, title, description, priority: priority || 'MEDIUM',
      status: 'PENDING', dueDate: dueDate ? new Date(dueDate) : undefined, dueTime, tags,
    }});
    res.status(201).json({ task });
  } catch(e: any) { res.status(500).json({ error: e.message }); }
});

// PATCH /api/tasks/:id/toggle
router.patch('/:id/toggle', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.task.findFirst({ where: { id: req.params.id, userId: USER_ID } });
    if (!existing) { res.status(404).json({ error: 'Not found' }); return; }
    const newStatus = existing.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    const task = await prisma.task.update({ where: { id: req.params.id }, data: { status: newStatus, completedAt: newStatus === 'COMPLETED' ? new Date() : null } });
    res.json({ task });
  } catch(e: any) { res.status(500).json({ error: e.message }); }
});

// PATCH /api/tasks/:id
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.task.findFirst({ where: { id: req.params.id, userId: USER_ID } });
    if (!existing) { res.status(404).json({ error: 'Not found' }); return; }
    const { title, description, priority, status, dueDate, dueTime, tags } = req.body;
    const task = await prisma.task.update({ where: { id: req.params.id }, data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(priority !== undefined && { priority }),
      ...(status !== undefined && { status }),
      ...(dueDate !== undefined && { dueDate: new Date(dueDate) }),
      ...(dueTime !== undefined && { dueTime }),
      ...(tags !== undefined && { tags }),
      completedAt: status === 'COMPLETED' && !existing.completedAt ? new Date() : existing.completedAt,
    }});
    res.json({ task });
  } catch(e: any) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.task.findFirst({ where: { id: req.params.id, userId: USER_ID } });
    if (!existing) { res.status(404).json({ error: 'Not found' }); return; }
    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch(e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
