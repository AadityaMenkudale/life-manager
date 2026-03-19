import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const USER_ID = 'default-user';

async function main() {
  console.log('🌱 Seeding...');

  // Create the single default user (no auth)
  await prisma.user.upsert({
    where: { id: USER_ID },
    update: {},
    create: {
      id: USER_ID,
      email: 'alex@lifemanager.app',
      username: 'alex',
      passwordHash: 'no-auth',
      displayName: 'Alex Johnson',
      avatarSeed: 'Alex',
      dailyCalorieGoal: 2400,
      dailyStepGoal: 10000,
    },
  });
  console.log('✅ User created');

  // Habits
  const habitDefs = [
    { id: 'habit-water', name: 'Drink 3L Water', icon: 'droplets', color: 'blue', category: 'HEALTH' },
    { id: 'habit-meditate', name: '10min Meditation', icon: 'sparkles', color: 'purple', category: 'MINDSET' },
    { id: 'habit-read', name: 'Read 20 Pages', icon: 'book-open', color: 'green', category: 'LEARNING' },
    { id: 'habit-workout', name: 'Morning Workout', icon: 'flame', color: 'orange', category: 'FITNESS' },
  ];
  for (const h of habitDefs) {
    await prisma.habit.upsert({ where: { id: h.id }, update: {}, create: { ...h, userId: USER_ID } });
  }

  // Habit logs for past 14 days
  for (let i = 0; i < 14; i++) {
    const d = new Date(); d.setDate(d.getDate()-i);
    const date = d.toISOString().split('T')[0];
    for (const h of habitDefs) {
      if (Math.random() > 0.3) {
        await prisma.habitLog.upsert({
          where: { habitId_date: { habitId: h.id, date } },
          update: {}, create: { habitId: h.id, userId: USER_ID, date },
        });
      }
    }
  }
  console.log('✅ Habits + logs seeded');

  // Tasks
  const taskDefs = [
    { title: 'Morning Workout', priority: 'HIGH', status: 'COMPLETED' },
    { title: 'Deep Work Session 1', priority: 'HIGH', status: 'COMPLETED' },
    { title: 'Read 20 Pages', priority: 'MEDIUM', status: 'PENDING' },
    { title: 'Meal Prep', priority: 'MEDIUM', status: 'COMPLETED' },
    { title: 'Review project proposal', priority: 'URGENT', status: 'IN_PROGRESS' },
    { title: 'Call with mentor', priority: 'HIGH', status: 'PENDING' },
    { title: 'Grocery shopping', priority: 'LOW', status: 'PENDING' },
    { title: 'Update journal', priority: 'LOW', status: 'COMPLETED' },
  ];
  for (const t of taskDefs) {
    await prisma.task.create({ data: { userId: USER_ID, ...t, completedAt: t.status === 'COMPLETED' ? new Date() : undefined } });
  }
  console.log('✅ Tasks seeded');

  // Workouts (past 7 days)
  const wDefs = [
    { name: 'Morning Run', type: 'RUNNING', durationMins: 45, caloriesBurned: 420 },
    { name: 'Strength Training', type: 'STRENGTH', durationMins: 60, caloriesBurned: 380 },
    { name: 'HIIT Session', type: 'HIIT', durationMins: 30, caloriesBurned: 350 },
    { name: 'Yoga Flow', type: 'YOGA', durationMins: 45, caloriesBurned: 180 },
  ];
  for (let i = 0; i < 7; i++) {
    if (Math.random() > 0.3) {
      const d = new Date(); d.setDate(d.getDate()-i);
      await prisma.workout.create({ data: { userId: USER_ID, ...wDefs[i%wDefs.length], loggedAt: d } });
    }
  }
  console.log('✅ Workouts seeded');

  // Meals today
  const mDefs = [
    { name: 'Oatmeal with Berries', mealType: 'BREAKFAST', calories: 320, proteinG: 12, carbsG: 58, fatG: 6 },
    { name: 'Chicken Caesar Salad', mealType: 'LUNCH', calories: 430, proteinG: 38, carbsG: 22, fatG: 18 },
    { name: 'Protein Shake', mealType: 'POST_WORKOUT', calories: 180, proteinG: 30, carbsG: 15, fatG: 3 },
  ];
  for (const m of mDefs) {
    await prisma.meal.create({ data: { userId: USER_ID, ...m } });
  }
  console.log('✅ Meals seeded');

  // Reminders
  const rDefs = [
    { title: 'Morning Workout', type: 'WORKOUT', time: '07:00', days: 'MON,TUE,WED,THU,FRI' },
    { title: 'Drink Water', type: 'WATER', time: '09:00', days: 'MON,TUE,WED,THU,FRI,SAT,SUN' },
    { title: 'Lunch Time', type: 'MEAL', time: '13:00', days: 'MON,TUE,WED,THU,FRI' },
    { title: 'Evening Meditation', type: 'HABIT', time: '21:00', days: 'MON,TUE,WED,THU,FRI,SAT,SUN' },
  ];
  for (const r of rDefs) {
    await prisma.reminder.create({ data: { userId: USER_ID, ...r } });
  }
  console.log('✅ Reminders seeded');
  console.log('\n🎉 Done! Start the server with: npm run dev');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
