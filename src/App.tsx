import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TapCounter } from './components/TapCounter';
import { View } from './types';
import {
  LayoutDashboard, CheckSquare, Heart, Repeat, BarChart3,
  CheckCircle2, Circle, Flame, Droplets, Sparkles, BookOpen,
  TrendingUp, Lightbulb, Plus, Trash2, Search, Bell, Dumbbell,
  Utensils, X, Star, Zap
} from 'lucide-react';
import { BarChart, Bar, Cell, ResponsiveContainer, XAxis, AreaChart, Area, LineChart, Line, Tooltip } from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Task { id: string; title: string; done: boolean; priority: 'LOW'|'MEDIUM'|'HIGH'|'URGENT'; }
interface Habit { id: string; name: string; emoji: string; color: string; streak: number; done: boolean; category: string; }
interface Workout { id: string; name: string; type: string; mins: number; cals: number; date: string; }
interface Meal { id: string; name: string; type: string; cals: number; protein: number; carbs: number; fat: number; date: string; }

// ─── Helpers ──────────────────────────────────────────────────────────────────
let uid = 1000;
const id = () => String(uid++);
const today = new Date().toLocaleDateString('en-CA');
const cls = (...c: (string|boolean|undefined)[]) => c.filter(Boolean).join(' ');

// ─── localStorage helpers ─────────────────────────────────────────────────────
function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}
function save<T>(key: string, value: T) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ─── Seed Data (used only on first ever load) ─────────────────────────────────
const INIT_TASKS: Task[] = [
  { id:'t1', title:'Morning Workout', done:true, priority:'HIGH' },
  { id:'t2', title:'Deep Work Session', done:true, priority:'HIGH' },
  { id:'t3', title:'Read 20 Pages', done:false, priority:'MEDIUM' },
  { id:'t4', title:'Meal Prep', done:true, priority:'MEDIUM' },
  { id:'t5', title:'Review Proposal', done:false, priority:'URGENT' },
  { id:'t6', title:'Call Mentor', done:false, priority:'HIGH' },
  { id:'t7', title:'Grocery Shopping', done:false, priority:'LOW' },
  { id:'t8', title:'Update Journal', done:true, priority:'LOW' },
];
const INIT_HABITS: Habit[] = [
  { id:'h1', name:'Drink 3L Water', emoji:'💧', color:'#3b82f6', streak:8, done:true, category:'Health' },
  { id:'h2', name:'Meditate 10min', emoji:'✨', color:'#8b5cf6', streak:12, done:true, category:'Mindset' },
  { id:'h3', name:'Read 20 Pages', emoji:'📖', color:'#22c55e', streak:5, done:false, category:'Learning' },
  { id:'h4', name:'Morning Workout', emoji:'🔥', color:'#f97316', streak:3, done:true, category:'Fitness' },
];
const INIT_WORKOUTS: Workout[] = [
  { id:'w1', name:'Morning Run', type:'Running', mins:45, cals:420, date:today },
  { id:'w2', name:'Strength Training', type:'Strength', mins:60, cals:380, date: new Date(Date.now()-86400000).toLocaleDateString('en-CA') },
  { id:'w3', name:'HIIT Session', type:'HIIT', mins:30, cals:350, date: new Date(Date.now()-2*86400000).toLocaleDateString('en-CA') },
];
const INIT_MEALS: Meal[] = [
  { id:'m1', name:'Oatmeal with Berries', type:'Breakfast', cals:320, protein:12, carbs:58, fat:6, date:today },
  { id:'m2', name:'Chicken Caesar Salad', type:'Lunch', cals:430, protein:38, carbs:22, fat:18, date:today },
  { id:'m3', name:'Protein Shake', type:'Snack', cals:180, protein:30, carbs:15, fat:3, date:today },
];

const PRIORITY_COLOR: Record<string,string> = { URGENT:'bg-red-100 text-red-700', HIGH:'bg-orange-100 text-orange-700', MEDIUM:'bg-blue-100 text-blue-700', LOW:'bg-gray-100 text-gray-500' };

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState<View>('dashboard');

  // All state loaded from localStorage on first render, saved on every change
  const [tasks, setTasksRaw] = useState<Task[]>(() => load('lm_tasks', INIT_TASKS));
  const [habits, setHabitsRaw] = useState<Habit[]>(() => load('lm_habits', INIT_HABITS));
  const [workouts, setWorkoutsRaw] = useState<Workout[]>(() => load('lm_workouts', INIT_WORKOUTS));
  const [meals, setMealsRaw] = useState<Meal[]>(() => load('lm_meals', INIT_MEALS));
  const [calGoal] = useState(2400);

  // Auto-save whenever data changes
  useEffect(() => { save('lm_tasks', tasks); }, [tasks]);
  useEffect(() => { save('lm_habits', habits); }, [habits]);
  useEffect(() => { save('lm_workouts', workouts); }, [workouts]);
  useEffect(() => { save('lm_meals', meals); }, [meals]);

  const setTasks = setTasksRaw;
  const setHabits = setHabitsRaw;
  const setWorkouts = setWorkoutsRaw;
  const setMeals = setMealsRaw;

  // Task actions
  const toggleTask = (i:string) => setTasks(ts => ts.map(t => t.id===i ? {...t,done:!t.done} : t));
  const addTask = (title:string, priority:'LOW'|'MEDIUM'|'HIGH'|'URGENT'='MEDIUM') => setTasks(ts => [{id:String(uid++),title,done:false,priority},...ts]);
  const delTask = (i:string) => setTasks(ts => ts.filter(t=>t.id!==i));

  // Habit actions
  const toggleHabit = (i:string) => setHabits(hs => hs.map(h => h.id===i ? {...h, done:!h.done, streak: h.done ? Math.max(0,h.streak-1) : h.streak+1} : h));
  const addHabit = (name:string, emoji:string, color:string, category:string) => setHabits(hs => [...hs,{id:String(uid++),name,emoji,color,streak:0,done:false,category}]);
  const delHabit = (i:string) => setHabits(hs => hs.filter(h=>h.id!==i));

  // Workout actions
  const addWorkout = (w:Omit<Workout,'id'|'date'>) => setWorkouts(ws => [{...w,id:String(uid++),date:today},...ws]);
  const delWorkout = (i:string) => setWorkouts(ws => ws.filter(w=>w.id!==i));

  // Meal actions
  const addMeal = (m:Omit<Meal,'id'|'date'>) => setMeals(ms => [...ms,{...m,id:String(uid++),date:today}]);
  const delMeal = (i:string) => setMeals(ms => ms.filter(m=>m.id!==i));

  const todayMeals = meals.filter(m=>m.date===today);
  const todayWorkouts = workouts.filter(w=>w.date===today);
  const totalCals = todayMeals.reduce((s,m)=>s+m.cals,0);
  const burnedCals = todayWorkouts.reduce((s,w)=>s+w.cals,0);
  const doneT = tasks.filter(t=>t.done).length;
  const doneH = habits.filter(h=>h.done).length;
  const lifeScore = Math.round(
    (tasks.length>0?doneT/tasks.length:0.5)*30 +
    (habits.length>0?doneH/habits.length:0.5)*30 +
    (totalCals>0?Math.max(0,20-Math.abs(totalCals-calGoal)/calGoal*20):10) +
    Math.min(20,todayWorkouts.reduce((s,w)=>s+w.mins,0)/30*20)
  );

  const props = { tasks,habits,workouts,meals,todayMeals,todayWorkouts,totalCals,burnedCals,calGoal,doneT,doneH,lifeScore,toggleTask,addTask,delTask,toggleHabit,addHabit,delHabit,addWorkout,delWorkout,addMeal,delMeal };

  return (
    <div className="flex min-h-screen bg-white font-sans">
      <Sidebar currentView={view} onViewChange={setView} />
      <main className="flex-1 overflow-y-auto bg-gray-50 pb-20 md:pb-0">
        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <LayoutDashboard size={16}/>
          </div>
          <span className="font-bold text-gray-900 text-sm">Life Manager</span>
          <span className="ml-auto text-xs text-gray-400 font-medium capitalize">{view === 'health' ? 'Fitness' : view === 'counter' ? 'Tap Counter' : view}</span>
        </div>
        {view==='dashboard' && <DashboardView {...props}/>}
        {view==='tasks'     && <TasksView {...props}/>}
        {view==='health'    && <FitnessView {...props}/>}
        {view==='habits'    && <HabitsView {...props}/>}
        {view==='analytics' && <AnalyticsView {...props}/>}
        {view==='counter'   && <TapCounter/>}
      </main>
    </div>
  );
}

// ─── Shared prop type ────────────────────────────────────────────────────────
interface P {
  tasks:Task[]; habits:Habit[]; workouts:Workout[]; meals:Meal[];
  todayMeals:Meal[]; todayWorkouts:Workout[];
  totalCals:number; burnedCals:number; calGoal:number;
  doneT:number; doneH:number; lifeScore:number;
  toggleTask:(i:string)=>void; addTask:(t:string,p?:Task['priority'])=>void; delTask:(i:string)=>void;
  toggleHabit:(i:string)=>void; addHabit:(n:string,e:string,c:string,cat:string)=>void; delHabit:(i:string)=>void;
  addWorkout:(w:Omit<Workout,'id'|'date'>)=>void; delWorkout:(i:string)=>void;
  addMeal:(m:Omit<Meal,'id'|'date'>)=>void; delMeal:(i:string)=>void;
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function DashboardView({tasks,habits,todayMeals,todayWorkouts,totalCals,burnedCals,calGoal,doneT,doneH,lifeScore,toggleTask,addTask,delTask,toggleHabit}:P) {
  const [newTask,setNewTask]=useState('');
  const [showAdd,setShowAdd]=useState(false);
  const rate = tasks.length>0?Math.round(doneT/tasks.length*100):0;

  const weekCals = Array.from({length:7},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-(6-i));
    const key=d.toLocaleDateString('en-CA');
    const isToday=i===6;
    return { day:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()], value:isToday?totalCals:Math.floor(1200+Math.random()*1000), isToday };
  });

  return (
    <div className="p-4 md:p-8">
      <header className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Overview</h2>
        <div className="flex items-center gap-3">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/><input placeholder="Search..." className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl w-52 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"/></div>
          <button className="p-2 text-gray-500 hover:text-gray-900 bg-white rounded-xl border border-gray-200"><Bell size={18}/></button>
        </div>
      </header>

      <div className="mb-6">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-1">Welcome back, Aadi 👋</h1>
        <p className="text-gray-500">{doneH} habits done · {doneT} of {tasks.length} tasks completed today</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Life Score */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col items-center text-center">
          <div className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold mb-6 self-end">
            <TrendingUp size={12}/> Live
          </div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Life Performance</h3>
          <div className="relative w-40 h-40 mb-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="65" fill="transparent" stroke="#f3f4f6" strokeWidth="14"/>
              <circle cx="80" cy="80" r="65" fill="transparent" stroke="#2563eb" strokeWidth="14"
                strokeDasharray={`${2*Math.PI*65}`} strokeDashoffset={`${2*Math.PI*65*(1-lifeScore/100)}`} strokeLinecap="round"/>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold text-gray-900">{lifeScore}</span>
              <span className="text-xs text-gray-400 font-semibold">/ 100</span>
            </div>
          </div>
          <p className="text-sm text-gray-500">Tasks · Habits · Nutrition · Fitness</p>
        </div>

        {/* Tasks */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Daily Progress</h3>
              <p className="text-3xl font-bold text-gray-900">{rate}%</p>
            </div>
            <span className="text-sm font-bold text-blue-600">{doneT}/{tasks.length} tasks</span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full mb-5 overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full transition-all duration-700" style={{width:`${rate}%`}}/>
          </div>
          {showAdd ? (
            <div className="flex gap-2 mb-4">
              <input autoFocus value={newTask} onChange={e=>setNewTask(e.target.value)} onKeyDown={e=>e.key==='Enter'&&(addTask(newTask),setNewTask(''),setShowAdd(false))}
                placeholder="Task name..." className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"/>
              <button onClick={()=>{addTask(newTask);setNewTask('');setShowAdd(false);}} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700">Add</button>
              <button onClick={()=>setShowAdd(false)} className="p-2 text-gray-400 hover:text-gray-600"><X size={16}/></button>
            </div>
          ) : (
            <button onClick={()=>setShowAdd(true)} className="flex items-center gap-1.5 text-sm text-blue-600 font-bold mb-4 hover:underline"><Plus size={15}/>Add Task</button>
          )}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {tasks.slice(0,7).map(t=>(
              <div key={t.id} className="flex items-center gap-2.5 group p-1.5 rounded-xl hover:bg-gray-50">
                <button onClick={()=>toggleTask(t.id)} className="shrink-0">
                  {t.done?<CheckCircle2 className="text-green-500" size={20}/>:<Circle className="text-gray-300 hover:text-blue-400" size={20}/>}
                </button>
                <span className={cls("text-sm font-medium flex-1 truncate",t.done?"line-through text-gray-400":"text-gray-900")}>{t.title}</span>
                <span className={cls("text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0",PRIORITY_COLOR[t.priority])}>{t.priority}</span>
                <button onClick={()=>delTask(t.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400"><Trash2 size={14}/></button>
              </div>
            ))}
          </div>
        </div>

        {/* Habits */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Habit Streaks</h3>
            <span className="text-xs font-bold text-blue-600">{doneH}/{habits.length} today</span>
          </div>
          <div className="space-y-4">
            {habits.map(h=>(
              <div key={h.id} className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0" style={{backgroundColor:h.color+'20'}}>{h.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1">
                    <p className="text-sm font-bold text-gray-900 truncate">{h.name}</p>
                    <span className="text-xs font-bold text-gray-400 shrink-0 ml-2">🔥{h.streak}</span>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({length:7},(_,i)=>(
                      <div key={i} className="h-1.5 flex-1 rounded-full" style={{backgroundColor:i<(h.streak%8)||h.done?h.color:'#f3f4f6'}}/>
                    ))}
                  </div>
                </div>
                <button onClick={()=>toggleHabit(h.id)} className={cls("w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 text-sm",h.done?"text-white border-transparent":"border-gray-200 hover:border-blue-300")} style={h.done?{backgroundColor:h.color,borderColor:h.color}:{}}>
                  {h.done&&'✓'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Calories */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Calorie Balance</h3>
            <span className="text-xs font-bold text-gray-400">Today</span>
          </div>
          <div className="flex gap-6">
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-400 mb-1">Consumed</p>
              <p className="text-4xl font-bold text-gray-900 mb-4">{totalCals.toLocaleString()}<span className="text-sm text-gray-400 ml-1">kcal</span></p>
              <p className="text-xs font-bold text-gray-400 mb-1">Goal</p>
              <p className="text-2xl font-bold text-gray-900 mb-4">{calGoal.toLocaleString()}<span className="text-sm text-gray-400 ml-1">kcal</span></p>
              <p className="text-xs font-bold text-gray-400 mb-1">Burned</p>
              <p className="text-lg font-bold text-orange-500">{burnedCals}<span className="text-sm text-gray-400 ml-1">kcal</span></p>
            </div>
            <div className="flex-1 h-36">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekCals}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize:10,fill:'#9ca3af'}}/>
                  <Bar dataKey="value" radius={[6,6,6,6]}>
                    {weekCals.map((e,i)=><Cell key={i} fill={e.isToday?'#2563eb':'#dbeafe'}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Insight */}
        <div className="lg:col-span-2 bg-blue-50 p-6 rounded-3xl border border-blue-100 flex gap-4 items-start">
          <div className="w-11 h-11 bg-blue-600 rounded-full flex items-center justify-center text-white shrink-0"><Lightbulb size={22}/></div>
          <div>
            <h4 className="font-bold text-gray-900 mb-1">Today's Insight</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              You've completed <strong>{doneT} of {tasks.length}</strong> tasks and <strong>{doneH} of {habits.length}</strong> habits.
              {totalCals>0&&<> Consumed <strong>{totalCals} kcal</strong> of your {calGoal} kcal goal.</>}
              {burnedCals>0&&<> Burned <strong>{burnedCals} kcal</strong> from workouts.</>}
              {' '}Your life score is <strong>{lifeScore}/100</strong> — {lifeScore>=80?'excellent work! 🎉':lifeScore>=60?'keep it up! 💪':'you can do better today! 🚀'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TASKS VIEW ───────────────────────────────────────────────────────────────
function TasksView({tasks,doneT,toggleTask,addTask,delTask}:P) {
  const [newTask,setNewTask]=useState('');
  const [priority,setPriority]=useState<Task['priority']>('MEDIUM');
  const [filter,setFilter]=useState('ALL');

  const filtered = tasks.filter(t => filter==='ALL'?true:filter==='DONE'?t.done:!t.done);

  return (
    <div className="p-4 md:p-8 max-w-3xl">
      <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">Tasks</h1>
      <p className="text-gray-500 mb-8">{doneT} of {tasks.length} completed</p>

      {/* Add Task */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 flex gap-3 items-center">
        <input value={newTask} onChange={e=>setNewTask(e.target.value)} onKeyDown={e=>e.key==='Enter'&&newTask.trim()&&(addTask(newTask.trim(),priority),setNewTask(''))}
          placeholder="Add a new task..." className="flex-1 text-sm focus:outline-none text-gray-800 placeholder-gray-400"/>
        <select value={priority} onChange={e=>setPriority(e.target.value as Task['priority'])} className="text-xs font-bold px-2 py-1.5 rounded-lg border border-gray-200 focus:outline-none text-gray-600">
          {['LOW','MEDIUM','HIGH','URGENT'].map(p=><option key={p}>{p}</option>)}
        </select>
        <button onClick={()=>{if(newTask.trim()){addTask(newTask.trim(),priority);setNewTask('');}}} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 flex items-center gap-1.5">
          <Plus size={15}/>Add
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['ALL','PENDING','DONE'].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} className={cls("px-4 py-1.5 rounded-full text-xs font-bold transition-all",filter===f?"bg-blue-600 text-white":"bg-white text-gray-500 border border-gray-200 hover:bg-gray-50")}>
            {f==='ALL'?`All (${tasks.length})`:f==='DONE'?`Done (${doneT})`:`Pending (${tasks.length-doneT})`}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {filtered.map(t=>(
          <div key={t.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 group hover:border-blue-100 transition-all">
            <button onClick={()=>toggleTask(t.id)} className="shrink-0">
              {t.done?<CheckCircle2 className="text-green-500" size={22}/>:<Circle className="text-gray-300 hover:text-blue-400" size={22}/>}
            </button>
            <span className={cls("flex-1 font-medium",t.done?"line-through text-gray-400":"text-gray-900")}>{t.title}</span>
            <span className={cls("text-[10px] font-bold px-2 py-1 rounded-lg",PRIORITY_COLOR[t.priority])}>{t.priority}</span>
            <button onClick={()=>delTask(t.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all"><Trash2 size={16}/></button>
          </div>
        ))}
        {filtered.length===0&&<p className="text-center text-gray-400 py-12">No tasks here. Add one above!</p>}
      </div>
    </div>
  );
}

// ─── FITNESS VIEW ─────────────────────────────────────────────────────────────
function FitnessView({workouts,meals,todayMeals,todayWorkouts,totalCals,burnedCals,calGoal,addWorkout,delWorkout,addMeal,delMeal}:P) {
  const [wForm,setWForm]=useState({name:'',type:'Running',mins:'',cals:''});
  const [mForm,setMForm]=useState({name:'',type:'Breakfast',cals:'',protein:'',carbs:'',fat:''});
  const [showW,setShowW]=useState(false);
  const [showM,setShowM]=useState(false);

  const totalMins = todayWorkouts.reduce((s,w)=>s+w.mins,0);
  const protein = todayMeals.reduce((s,m)=>s+m.protein,0);
  const carbs = todayMeals.reduce((s,m)=>s+m.carbs,0);
  const fat = todayMeals.reduce((s,m)=>s+m.fat,0);
  const calPct = Math.min(100,Math.round(totalCals/calGoal*100));

  const chartData = Array.from({length:7},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-(6-i));
    const key=d.toLocaleDateString('en-CA');
    const dayW=workouts.filter(w=>w.date===key);
    return {day:['S','M','T','W','T','F','S'][d.getDay()], mins:dayW.reduce((s,w)=>s+w.mins,0)};
  });

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-1">Fitness Hub</h1>
          <p className="text-gray-500">{todayWorkouts.length} workouts · {totalMins} mins today</p>
        </div>
        <button onClick={()=>setShowW(true)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200">
          <Plus size={18}/>Log Workout
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          {label:'Calories Burned',val:burnedCals+'',unit:'kcal',color:'text-orange-500',bg:'bg-orange-50'},
          {label:'Active Minutes',val:totalMins+'',unit:'min',color:'text-blue-500',bg:'bg-blue-50'},
          {label:'Calories Consumed',val:totalCals+'',unit:'kcal',color:'text-green-500',bg:'bg-green-50'},
          {label:'Meals Logged',val:todayMeals.length+'',unit:'today',color:'text-purple-500',bg:'bg-purple-50'},
        ].map(s=>(
          <div key={s.label} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-bold text-gray-400 mb-2">{s.label}</p>
            <p className={cls("text-3xl font-bold",s.color)}>{s.val}</p>
            <p className="text-xs text-gray-400 mt-1">{s.unit}</p>
          </div>
        ))}
      </div>

      {/* Workout Form */}
      {showW&&(
        <div className="bg-white rounded-2xl border border-blue-100 p-5 mb-6">
          <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-gray-900">Log Workout</h3><button onClick={()=>setShowW(false)}><X size={18} className="text-gray-400"/></button></div>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Workout name" value={wForm.name} onChange={e=>setWForm({...wForm,name:e.target.value})} className="col-span-2 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"/>
            <select value={wForm.type} onChange={e=>setWForm({...wForm,type:e.target.value})} className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none">
              {['Running','Walking','Cycling','Swimming','Strength','HIIT','Yoga','Cardio','Other'].map(t=><option key={t}>{t}</option>)}
            </select>
            <input placeholder="Duration (mins)" type="number" value={wForm.mins} onChange={e=>setWForm({...wForm,mins:e.target.value})} className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"/>
            <input placeholder="Calories burned" type="number" value={wForm.cals} onChange={e=>setWForm({...wForm,cals:e.target.value})} className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"/>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={()=>{if(wForm.name&&wForm.mins){addWorkout({name:wForm.name,type:wForm.type,mins:+wForm.mins,cals:+wForm.cals||0});setWForm({name:'',type:'Running',mins:'',cals:''});setShowW(false);}}} className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700">Save</button>
            <button onClick={()=>setShowW(false)} className="px-5 py-2 text-gray-500 text-sm hover:text-gray-700">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Workouts */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">Recent Workouts</h3>
            {workouts.length===0?<p className="text-gray-400 text-sm text-center py-8">No workouts logged yet.</p>:(
              <div className="space-y-3">
                {workouts.slice(0,5).map(w=>(
                  <div key={w.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 group">
                    <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><Dumbbell size={20}/></div>
                    <div className="flex-1"><p className="font-bold text-gray-900 text-sm">{w.name}</p><p className="text-xs text-gray-400">{w.type} · {w.mins} mins</p></div>
                    <div className="text-right"><p className="font-bold text-gray-900 text-sm">{w.cals} kcal</p><p className="text-xs text-gray-400">{w.date===today?'Today':w.date}</p></div>
                    <button onClick={()=>delWorkout(w.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 ml-1"><Trash2 size={15}/></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Chart */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">Weekly Activity (minutes)</h3>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{left:-20,bottom:0}}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize:12,fill:'#9ca3af'}}/>
                  <Bar dataKey="mins" radius={[8,8,8,8]} barSize={36}>
                    {chartData.map((_,i)=><Cell key={i} fill={i===6?'#2563eb':'#dbeafe'}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Nutrition Panel */}
        <div className="space-y-5">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5"><Utensils size={18} className="text-blue-600"/><h3 className="font-bold text-gray-900">Nutrition</h3></div>
            <div className="relative w-36 h-36 mx-auto mb-5">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 144 144">
                <circle cx="72" cy="72" r="55" fill="transparent" stroke="#f3f4f6" strokeWidth="12"/>
                <circle cx="72" cy="72" r="55" fill="transparent" stroke="#2563eb" strokeWidth="12"
                  strokeDasharray={`${2*Math.PI*55}`} strokeDashoffset={`${2*Math.PI*55*(1-calPct/100)}`} strokeLinecap="round"/>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-2xl font-bold text-gray-900">{calPct}%</p>
                <p className="text-[10px] text-gray-400 font-bold">of goal</p>
              </div>
            </div>
            <div className="space-y-1.5 text-sm mb-5">
              <div className="flex justify-between"><span className="text-gray-500">Consumed</span><span className="font-bold">{totalCals} kcal</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Goal</span><span className="font-bold">{calGoal} kcal</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Remaining</span><span className="font-bold text-green-600">{Math.max(0,calGoal-totalCals)} kcal</span></div>
            </div>
            <div className="space-y-2.5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Macros</p>
              {[{l:'Protein',v:protein,max:150,c:'bg-blue-500'},{l:'Carbs',v:carbs,max:300,c:'bg-orange-400'},{l:'Fat',v:fat,max:80,c:'bg-pink-500'}].map(m=>(
                <div key={m.l}>
                  <div className="flex justify-between text-xs mb-1"><span className="font-bold text-gray-700">{m.l}</span><span className="text-gray-400">{Math.round(m.v)}g</span></div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={cls("h-full rounded-full",m.c)} style={{width:`${Math.min(100,(m.v/m.max)*100)}%`}}/></div>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Meals */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900">Today's Meals</h3>
              <button onClick={()=>setShowM(!showM)} className="text-blue-600 hover:text-blue-700"><Plus size={20}/></button>
            </div>
            {showM&&(
              <div className="mb-4 space-y-2">
                <input placeholder="Meal name" value={mForm.name} onChange={e=>setMForm({...mForm,name:e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"/>
                <select value={mForm.type} onChange={e=>setMForm({...mForm,type:e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none">
                  {['Breakfast','Lunch','Dinner','Snack','Pre-Workout','Post-Workout'].map(t=><option key={t}>{t}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <input placeholder="Calories" type="number" value={mForm.cals} onChange={e=>setMForm({...mForm,cals:e.target.value})} className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"/>
                  <input placeholder="Protein g" type="number" value={mForm.protein} onChange={e=>setMForm({...mForm,protein:e.target.value})} className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"/>
                  <input placeholder="Carbs g" type="number" value={mForm.carbs} onChange={e=>setMForm({...mForm,carbs:e.target.value})} className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"/>
                  <input placeholder="Fat g" type="number" value={mForm.fat} onChange={e=>setMForm({...mForm,fat:e.target.value})} className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"/>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>{if(mForm.name&&mForm.cals){addMeal({name:mForm.name,type:mForm.type,cals:+mForm.cals,protein:+mForm.protein||0,carbs:+mForm.carbs||0,fat:+mForm.fat||0});setMForm({name:'',type:'Breakfast',cals:'',protein:'',carbs:'',fat:''});setShowM(false);}}} className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700">Add</button>
                  <button onClick={()=>setShowM(false)} className="px-4 py-2 text-gray-400 text-sm hover:text-gray-600">Cancel</button>
                </div>
              </div>
            )}
            {todayMeals.length===0?<p className="text-gray-400 text-sm text-center py-4">No meals logged today.</p>:(
              <div className="space-y-2.5">
                {todayMeals.map(m=>(
                  <div key={m.id} className="flex items-center gap-2.5 group">
                    <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 shrink-0"><Utensils size={16}/></div>
                    <div className="flex-1 min-w-0"><p className="text-sm font-bold text-gray-900 truncate">{m.name}</p><p className="text-[10px] text-gray-400">{m.type} · {m.cals} kcal</p></div>
                    <CheckCircle2 className="text-green-500 shrink-0" size={18}/>
                    <button onClick={()=>delMeal(m.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400"><Trash2 size={14}/></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── HABITS VIEW ──────────────────────────────────────────────────────────────
function HabitsView({habits,doneH,toggleHabit,addHabit,delHabit}:P) {
  const [form,setForm]=useState({name:'',emoji:'⭐',color:'#3b82f6',category:'Health'});
  const [showForm,setShowForm]=useState(false);
  const [filter,setFilter]=useState('All');

  const cats=['All','Health','Fitness','Mindset','Learning'];
  const emojis=['💧','🔥','✨','📖','🏃','🧘','💪','🥗','😴','📝','🎯','⭐'];
  const colors=['#3b82f6','#8b5cf6','#22c55e','#f97316','#ef4444','#06b6d4','#f59e0b','#ec4899'];

  const filtered = filter==='All'?habits:habits.filter(h=>h.category===filter);

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-1">Daily Habits</h1>
          <p className="text-gray-500">{doneH} of {habits.length} completed today</p>
        </div>
        <button onClick={()=>setShowForm(!showForm)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200">
          <Plus size={18}/>Add Habit
        </button>
      </div>

      {/* Add Habit Form */}
      {showForm&&(
        <div className="bg-white rounded-2xl border border-blue-100 p-5 mb-6">
          <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-gray-900">New Habit</h3><button onClick={()=>setShowForm(false)}><X size={18} className="text-gray-400"/></button></div>
          <div className="space-y-3">
            <input placeholder="Habit name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} onKeyDown={e=>e.key==='Enter'&&form.name&&(addHabit(form.name,form.emoji,form.color,form.category),setForm({name:'',emoji:'⭐',color:'#3b82f6',category:'Health'}),setShowForm(false))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"/>
            <div>
              <p className="text-xs font-bold text-gray-400 mb-2">Emoji</p>
              <div className="flex flex-wrap gap-2">{emojis.map(e=><button key={e} onClick={()=>setForm({...form,emoji:e})} className={cls("text-xl p-1.5 rounded-lg transition-all",form.emoji===e?"bg-blue-100 scale-110":"hover:bg-gray-100")}>{e}</button>)}</div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 mb-2">Color</p>
              <div className="flex gap-2">{colors.map(c=><button key={c} onClick={()=>setForm({...form,color:c})} className={cls("w-7 h-7 rounded-full transition-all",form.color===c?"scale-125 ring-2 ring-offset-2 ring-gray-400":"")} style={{backgroundColor:c}}/>)}</div>
            </div>
            <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none">
              {['Health','Fitness','Mindset','Learning','Social','Nutrition','Other'].map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={()=>{if(form.name){addHabit(form.name,form.emoji,form.color,form.category);setForm({name:'',emoji:'⭐',color:'#3b82f6',category:'Health'});setShowForm(false);}}} className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700">Create</button>
            <button onClick={()=>setShowForm(false)} className="px-5 py-2 text-gray-500 text-sm hover:text-gray-700">Cancel</button>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {cats.map(c=>(
          <button key={c} onClick={()=>setFilter(c)} className={cls("px-5 py-2 rounded-full text-sm font-bold transition-all",filter===c?"bg-blue-600 text-white shadow-lg shadow-blue-200":"bg-white text-gray-500 border border-gray-200 hover:bg-gray-50")}>
            {c}
          </button>
        ))}
      </div>

      {/* Habit Cards */}
      {filtered.length===0?<p className="text-center text-gray-400 py-16 text-lg">No habits yet. Create your first one!</p>:(
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filtered.map(h=>(
            <div key={h.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 relative group hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-start mb-5">
                <div className="w-13 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{backgroundColor:h.color+'20'}}>{h.emoji}</div>
                <div className="flex items-center gap-2">
                  <button onClick={()=>delHabit(h.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all"><Trash2 size={16}/></button>
                  <button onClick={()=>toggleHabit(h.id)} className="w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all text-sm font-bold" style={h.done?{backgroundColor:h.color,borderColor:h.color,color:'white'}:{borderColor:'#e5e7eb'}}>
                    {h.done?'✓':''}
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{h.name}</h3>
              <p className="text-xs text-gray-400 mb-3">{h.category}</p>
              <div className="flex items-center gap-1.5" style={{color:h.color}}>
                <Flame size={14} fill="currentColor"/>
                <span className="text-xs font-bold">{h.streak} day streak</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Smart Tip */}
      <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex gap-4 items-start">
        <div className="w-11 h-11 bg-blue-600 rounded-full flex items-center justify-center text-white shrink-0"><Lightbulb size={20}/></div>
        <div>
          <h4 className="font-bold text-gray-900 mb-1">Smart Tip</h4>
          <p className="text-sm text-gray-600 leading-relaxed">
            {doneH===0?"Start by completing one habit today to build momentum! 🚀":
             doneH===habits.length?"Amazing! You've completed ALL your habits today! You're on fire! 🔥":
             `You're ${Math.round(doneH/habits.length*100)}% done with today's habits. ${habits.length-doneH} left to go! 💪`}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── ANALYTICS VIEW ───────────────────────────────────────────────────────────
function AnalyticsView({tasks,habits,workouts,meals,doneT,doneH,lifeScore,calGoal}:P) {
  const taskRate = tasks.length>0?Math.round(doneT/tasks.length*100):0;
  const habitRate = habits.length>0?Math.round(doneH/habits.length*100):0;
  const totalWorkoutMins = workouts.reduce((s,w)=>s+w.mins,0);
  const totalCalsBurned = workouts.reduce((s,w)=>s+w.cals,0);

  const scoreData = Array.from({length:7},(_,i)=>({
    day:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i],
    score:Math.floor(55+Math.random()*35),
  }));
  scoreData[6].score = lifeScore;

  const weekActivity = Array.from({length:7},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-(6-i));
    const key=d.toLocaleDateString('en-CA');
    const dayW=workouts.filter(w=>w.date===key);
    return {day:['S','M','T','W','T','F','S'][d.getDay()], mins:dayW.reduce((s,w)=>s+w.mins,0)};
  });

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">Analytics</h1>
      <p className="text-gray-500 mb-8">Your performance overview</p>

      {/* Score Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          {label:'Life Score',val:`${lifeScore}`,unit:'/100',color:'text-blue-600',bg:'bg-blue-50'},
          {label:'Task Rate',val:`${taskRate}%`,unit:`${doneT}/${tasks.length}`,color:'text-green-600',bg:'bg-green-50'},
          {label:'Habit Rate',val:`${habitRate}%`,unit:`${doneH}/${habits.length} today`,color:'text-purple-600',bg:'bg-purple-50'},
          {label:'Workouts',val:`${workouts.length}`,unit:`${totalWorkoutMins} mins total`,color:'text-orange-600',bg:'bg-orange-50'},
        ].map(s=>(
          <div key={s.label} className={cls("rounded-3xl p-6 border border-gray-100",s.bg)}>
            <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">{s.label}</p>
            <p className={cls("text-3xl font-bold",s.color)}>{s.val}</p>
            <p className="text-xs text-gray-400 mt-1">{s.unit}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
        {/* Life Score Chart */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-5">Life Score This Week</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scoreData}>
                <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/><stop offset="95%" stopColor="#2563eb" stopOpacity={0}/></linearGradient></defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize:12,fill:'#9ca3af'}}/>
                <Tooltip contentStyle={{borderRadius:'12px',border:'none',boxShadow:'0 4px 20px rgba(0,0,0,0.1)'}}/>
                <Area type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} fill="url(#sg)"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-5">Weekly Workout Minutes</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekActivity} margin={{left:-20}}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize:12,fill:'#9ca3af'}}/>
                <Tooltip contentStyle={{borderRadius:'12px',border:'none',boxShadow:'0 4px 20px rgba(0,0,0,0.1)'}}/>
                <Bar dataKey="mins" radius={[8,8,8,8]} barSize={32}>
                  {weekActivity.map((_,i)=><Cell key={i} fill={i===6?'#2563eb':'#dbeafe'}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {title:'Task Completion',items:[{l:'Total Tasks',v:tasks.length},{l:'Completed',v:doneT},{l:'Pending',v:tasks.length-doneT},{l:'Completion Rate',v:`${taskRate}%`}]},
          {title:'Fitness Summary',items:[{l:'Total Workouts',v:workouts.length},{l:'Total Minutes',v:totalWorkoutMins},{l:'Calories Burned',v:totalCalsBurned},{l:'Today Workouts',v:workouts.filter(w=>w.date===new Date().toLocaleDateString('en-CA')).length}]},
          {title:'Habit Tracking',items:[{l:'Total Habits',v:habits.length},{l:'Done Today',v:doneH},{l:'Pending Today',v:habits.length-doneH},{l:'Best Streak',v:`${Math.max(0,...habits.map(h=>h.streak))} days`}]},
        ].map(card=>(
          <div key={card.title} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">{card.title}</h3>
            <div className="space-y-3">
              {card.items.map(item=>(
                <div key={item.l} className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{item.l}</span>
                  <span className="font-bold text-gray-900">{item.v}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
