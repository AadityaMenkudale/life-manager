import React from 'react';
import { LayoutDashboard, CheckSquare, Heart, Repeat, BarChart3, Settings, Gauge } from 'lucide-react';
import { View } from '../types';

interface Props { currentView: View; onViewChange: (v: View) => void; }

const nav = [
  { id:'dashboard', label:'Home',     icon:LayoutDashboard },
  { id:'tasks',     label:'Tasks',    icon:CheckSquare },
  { id:'health',    label:'Fitness',  icon:Heart },
  { id:'habits',    label:'Habits',   icon:Repeat },
  { id:'counter',   label:'Counter',  icon:Gauge },
  { id:'analytics', label:'Stats',    icon:BarChart3 },
] as const;

export function Sidebar({ currentView, onViewChange }: Props) {
  return (
    <>
      {/* ── Desktop sidebar (hidden on mobile) ── */}
      <div className="hidden md:flex w-64 bg-white border-r border-gray-100 flex-col h-screen sticky top-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
            <LayoutDashboard size={22} />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 leading-tight">Life Manager</h1>
            <p className="text-xs text-gray-400">Personal Growth</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {nav.map(item => (
            <button key={item.id} onClick={() => onViewChange(item.id as View)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                currentView === item.id
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}>
              <item.icon size={20} className={currentView===item.id?'text-blue-600':'text-gray-400'}/>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">AJ</div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Aadi Menkudale</p>
              <p className="text-xs text-gray-400">Premium Member</p>
            </div>
            <Settings size={16} className="text-gray-400"/>
          </div>
        </div>
      </div>

      {/* ── Mobile bottom nav (hidden on desktop) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex">
          {nav.map(item => (
            <button key={item.id} onClick={() => onViewChange(item.id as View)}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-all ${
                currentView === item.id ? 'text-blue-600' : 'text-gray-400'
              }`}>
              <item.icon size={22} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {currentView === item.id && (
                <span className="absolute top-0 w-8 h-0.5 bg-blue-600 rounded-full"/>
              )}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
