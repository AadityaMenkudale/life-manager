import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, RotateCcw, X, ChevronDown, ChevronUp, Check } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Counter {
  id: string;
  name: string;
  emoji: string;
  color: string;
  goal: number;
  unit: string;
  logs: Record<string, number>; // date -> count
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const today = () => new Date().toLocaleDateString('en-CA');
const uid = () => Math.random().toString(36).slice(2, 9);

function load<T>(key: string, fb: T): T {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fb; } catch { return fb; }
}
function save<T>(key: string, v: T) {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
}

const EMOJIS = ['💧','💊','🚬','☕','🍎','🥤','🏃','😴','📖','🎯','💪','🧘','🍵','🥛','🍫','🧃'];
const COLORS = [
  { name:'blue',   bg:'#EFF6FF', ring:'#3B82F6', btn:'#2563EB', text:'#1D4ED8' },
  { name:'green',  bg:'#F0FDF4', ring:'#22C55E', btn:'#16A34A', text:'#15803D' },
  { name:'orange', bg:'#FFF7ED', ring:'#F97316', btn:'#EA580C', text:'#C2410C' },
  { name:'purple', bg:'#FAF5FF', ring:'#A855F7', btn:'#9333EA', text:'#7E22CE' },
  { name:'red',    bg:'#FFF1F2', ring:'#F43F5E', btn:'#E11D48', text:'#BE123C' },
  { name:'teal',   bg:'#F0FDFA', ring:'#14B8A6', btn:'#0D9488', text:'#0F766E' },
  { name:'amber',  bg:'#FFFBEB', ring:'#F59E0B', btn:'#D97706', text:'#B45309' },
  { name:'pink',   bg:'#FDF2F8', ring:'#EC4899', btn:'#DB2777', text:'#BE185D' },
];

const PRESETS = [
  { name:'Water glasses', emoji:'💧', color:'blue',   goal:8,  unit:'glasses' },
  { name:'Medicine',      emoji:'💊', color:'green',  goal:3,  unit:'pills'   },
  { name:'Coffee',        emoji:'☕', color:'orange', goal:3,  unit:'cups'    },
  { name:'Cigarettes',    emoji:'🚬', color:'red',    goal:10, unit:'smoked'  },
  { name:'Steps (100s)',  emoji:'🏃', color:'teal',   goal:100,unit:'×100'    },
  { name:'Pages read',    emoji:'📖', color:'purple', goal:20, unit:'pages'   },
];

const INIT_COUNTERS: Counter[] = [
  { id:'c1', name:'Water glasses', emoji:'💧', color:'blue',   goal:8,  unit:'glasses', logs:{ [today()]: 3 } },
  { id:'c2', name:'Medicine',      emoji:'💊', color:'green',  goal:3,  unit:'pills',   logs:{ [today()]: 1 } },
];

// ─── Main Component ──────────────────────────────────────────────────────────
export function TapCounter() {
  const [counters, setCountersRaw] = useState<Counter[]>(() => load('lm_counters', INIT_COUNTERS));
  const [showCreate, setShowCreate] = useState(false);
  const [showHistory, setShowHistory] = useState<string|null>(null);
  const [ripple, setRipple] = useState<{id:string, x:number, y:number}|null>(null);

  // Form state
  const [form, setForm] = useState({ name:'', emoji:'💧', color:'blue', goal:'8', unit:'times' });

  const setCounters = (v: Counter[] | ((prev: Counter[]) => Counter[])) => {
    setCountersRaw(prev => {
      const next = typeof v === 'function' ? v(prev) : v;
      save('lm_counters', next);
      return next;
    });
  };

  const tap = (id: string, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setRipple({ id, x: e.clientX - rect.left, y: e.clientY - rect.top });
    setTimeout(() => setRipple(null), 600);

    setCounters(cs => cs.map(c => {
      if (c.id !== id) return c;
      const d = today();
      return { ...c, logs: { ...c.logs, [d]: (c.logs[d] || 0) + 1 } };
    }));

    // Haptic on mobile
    if (navigator.vibrate) navigator.vibrate(30);
  };

  const decrement = (id: string) => {
    setCounters(cs => cs.map(c => {
      if (c.id !== id) return c;
      const d = today();
      const cur = c.logs[d] || 0;
      if (cur <= 0) return c;
      return { ...c, logs: { ...c.logs, [d]: cur - 1 } };
    }));
  };

  const reset = (id: string) => {
    setCounters(cs => cs.map(c => {
      if (c.id !== id) return c;
      const d = today();
      return { ...c, logs: { ...c.logs, [d]: 0 } };
    }));
  };

  const deleteCounter = (id: string) => {
    setCounters(cs => cs.filter(c => c.id !== id));
  };

  const addCounter = () => {
    if (!form.name.trim()) return;
    const newC: Counter = {
      id: uid(),
      name: form.name.trim(),
      emoji: form.emoji,
      color: form.color,
      goal: parseInt(form.goal) || 1,
      unit: form.unit.trim() || 'times',
      logs: {},
    };
    setCounters(cs => [...cs, newC]);
    setForm({ name:'', emoji:'💧', color:'blue', goal:'8', unit:'times' });
    setShowCreate(false);
  };

  const addPreset = (p: typeof PRESETS[0]) => {
    const newC: Counter = { id: uid(), ...p, logs: {} };
    setCounters(cs => [...cs, newC]);
  };

  const getColor = (name: string) => COLORS.find(c => c.name === name) || COLORS[0];

  const getLast7 = (c: Counter) => {
    return Array.from({length:7}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toLocaleDateString('en-CA');
      return { date: key, day: ['S','M','T','W','T','F','S'][d.getDay()], count: c.logs[key] || 0 };
    });
  };

  const todayCount = (c: Counter) => c.logs[today()] || 0;
  const goalPct = (c: Counter) => Math.min(100, Math.round((todayCount(c) / c.goal) * 100));
  const isGoalMet = (c: Counter) => todayCount(c) >= c.goal;

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900">Tap Counter</h1>
          <p className="text-gray-500 mt-1">Track anything with a single tap</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95">
          <Plus size={18}/> New Counter
        </button>
      </div>

      {/* Summary strip */}
      <div className="flex gap-2 md:gap-3 mt-4 mb-6">
        {[
          { label:'Total counters', val: counters.length },
          { label:'Goals met today', val: counters.filter(isGoalMet).length },
          { label:'Total taps today', val: counters.reduce((s,c) => s + todayCount(c), 0) },
        ].map(s => (
          <div key={s.label} className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{s.val}</p>
          </div>
        ))}
      </div>

      {/* Counter Cards */}
      {counters.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">🎯</p>
          <p className="text-lg font-medium">No counters yet</p>
          <p className="text-sm mt-1">Create one above or pick a preset below</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {counters.map(c => {
            const col = getColor(c.color);
            const count = todayCount(c);
            const pct = goalPct(c);
            const done = isGoalMet(c);
            const isShowingHistory = showHistory === c.id;
            const last7 = getLast7(c);
            const maxBar = Math.max(...last7.map(d => d.count), c.goal, 1);

            return (
              <div key={c.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Main tap area */}
                <div className="relative p-5 md:p-6 cursor-pointer select-none overflow-hidden active:opacity-90"
                  style={{ backgroundColor: done ? col.bg : 'white' }}
                  onClick={e => tap(c.id, e)}>

                  {/* Ripple */}
                  {ripple?.id === c.id && (
                    <span className="absolute rounded-full animate-ping pointer-events-none"
                      style={{ width:80, height:80, left: ripple.x-40, top: ripple.y-40, backgroundColor: col.ring, opacity: 0.25 }}/>
                  )}

                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{c.emoji}</span>
                        <span className="font-bold text-gray-900 text-lg">{c.name}</span>
                        {done && <span className="flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full" style={{backgroundColor: col.bg, color: col.text}}><Check size={11}/>Done!</span>}
                      </div>
                      <p className="text-xs text-gray-400">Goal: {c.goal} {c.unit} today</p>
                    </div>
                    <div className="text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1.5">
                        <button onClick={() => decrement(c.id)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-bold transition-all active:scale-90">−</button>
                        <button onClick={() => reset(c.id)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 transition-all active:scale-90"><RotateCcw size={13}/></button>
                        <button onClick={() => deleteCounter(c.id)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-red-100 hover:text-red-500 flex items-center justify-center text-gray-400 transition-all active:scale-90"><Trash2 size={13}/></button>
                      </div>
                    </div>
                  </div>

                  {/* Big count */}
                  <div className="flex items-end gap-3 mb-4">
                    <span className="text-6xl md:text-7xl font-bold leading-none" style={{ color: col.btn }}>{count}</span>
                    <span className="text-gray-400 text-sm font-medium mb-2">/ {c.goal} {c.unit}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, backgroundColor: col.btn }}/>
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">{pct}% of daily goal · tap anywhere to count</p>
                </div>

                {/* History toggle */}
                <button onClick={() => setShowHistory(isShowingHistory ? null : c.id)}
                  className="w-full flex items-center justify-between px-6 py-3 border-t border-gray-100 text-xs font-bold text-gray-400 hover:bg-gray-50 transition-all">
                  <span>Last 7 days</span>
                  {isShowingHistory ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                </button>

                {/* 7-day mini chart */}
                {isShowingHistory && (
                  <div className="px-6 pb-5 pt-2">
                    <div className="flex items-end gap-2 h-20">
                      {last7.map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full rounded-t-md transition-all" style={{
                            height: `${Math.round((d.count / maxBar) * 64) + 4}px`,
                            backgroundColor: d.date === today() ? col.btn : col.ring + '55',
                            minHeight: '4px',
                          }}/>
                          <span className="text-[10px] font-bold text-gray-400">{d.day}</span>
                          {d.count > 0 && <span className="text-[10px] font-bold" style={{color: col.text}}>{d.count}</span>}
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex justify-between text-[10px] text-gray-400 font-bold">
                      <span>Total 7d: {last7.reduce((s,d) => s+d.count,0)} {c.unit}</span>
                      <span>Avg: {(last7.reduce((s,d) => s+d.count,0)/7).toFixed(1)}/day</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Presets */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-8">
        <h3 className="font-bold text-gray-900 mb-4">Quick add presets</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {PRESETS.filter(p => !counters.some(c => c.name === p.name)).map(p => (
            <button key={p.name} onClick={() => addPreset(p)}
              className="flex items-center gap-2.5 p-3 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all group text-left">
              <span className="text-xl">{p.emoji}</span>
              <div>
                <p className="text-sm font-bold text-gray-900 group-hover:text-blue-700">{p.name}</p>
                <p className="text-xs text-gray-400">Goal: {p.goal} {p.unit}</p>
              </div>
              <Plus size={14} className="ml-auto text-gray-300 group-hover:text-blue-500"/>
            </button>
          ))}
          {PRESETS.every(p => counters.some(c => c.name === p.name)) && (
            <p className="text-sm text-gray-400 col-span-3 text-center py-2">All presets added!</p>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-gray-900">New Counter</h3>
              <button onClick={() => setShowCreate(false)} className="p-1.5 text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>

            <div className="space-y-4">
              <input placeholder="Counter name (e.g. Water glasses)"
                value={form.name} onChange={e => setForm({...form, name:e.target.value})}
                onKeyDown={e => e.key==='Enter' && addCounter()}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"/>

              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Pick an emoji</p>
                <div className="flex flex-wrap gap-2">
                  {EMOJIS.map(e => (
                    <button key={e} onClick={() => setForm({...form, emoji:e})}
                      className={`text-xl p-1.5 rounded-xl transition-all ${form.emoji===e?'bg-blue-100 scale-110 ring-2 ring-blue-300':'hover:bg-gray-100'}`}>{e}</button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Color</p>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(c => (
                    <button key={c.name} onClick={() => setForm({...form, color:c.name})}
                      className={`w-8 h-8 rounded-full transition-all border-2 ${form.color===c.name?'scale-125 border-gray-400':'border-transparent'}`}
                      style={{backgroundColor: c.btn}}/>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Daily goal</p>
                  <input type="number" min="1" value={form.goal} onChange={e => setForm({...form, goal:e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"/>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Unit label</p>
                  <input placeholder="times, cups, pills…" value={form.unit} onChange={e => setForm({...form, unit:e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"/>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={addCounter}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95">
                Create Counter
              </button>
              <button onClick={() => setShowCreate(false)}
                className="px-5 py-3 text-gray-500 hover:text-gray-700 text-sm font-medium">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
