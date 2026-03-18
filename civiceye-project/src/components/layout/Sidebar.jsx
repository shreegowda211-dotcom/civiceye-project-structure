import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  Bell,
  MessageCircle,
  User,
  HelpCircle,
  LogOut,
  Shield,
} from 'lucide-react';

const menuItems = [
  { icon: <LayoutDashboard className="h-5 w-5" />, label: 'Dashboard', path: '/citizen/dashboard' },
  { icon: <PlusCircle className="h-5 w-5" />, label: 'Report Issue', path: '/citizen/report' },
  { icon: <ClipboardList className="h-5 w-5" />, label: 'My Complaints', path: '/citizen/issues' },
  { icon: <Bell className="h-5 w-5" />, label: 'Notifications', path: '/citizen/notifications' },
  { icon: <MessageCircle className="h-5 w-5" />, label: 'Feedback', path: '/citizen/feedback' },
  { icon: <User className="h-5 w-5" />, label: 'Profile', path: '/citizen/profile' },
  { icon: <HelpCircle className="h-5 w-5" />, label: 'Help', path: '/citizen/help' },
];

export default function Sidebar({ collapsed, onToggle, onLogout }) {
  return (
    <aside
      className={`fixed inset-y-16 left-0 z-30 flex h-[calc(100vh-64px)] flex-col overflow-hidden border-r border-slate-800 bg-white/10 backdrop-blur-xl transition-all duration-300 lg:relative lg:z-auto lg:w-${collapsed ? '20' : '64'}`}
    >
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 p-2 text-white">
            <Shield className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-white">CivicEye</h1>
              <p className="text-xs text-slate-200">Citizen Console</p>
            </div>
          )}
        </div>
        <button
          onClick={onToggle}
          className="rounded-md border border-slate-300/30 px-2 py-1 text-xs text-white hover:bg-white/20"
          aria-label="Toggle sidebar"
        >
          {collapsed ? '>' : '<'}
        </button>
      </div>

      <nav className="overflow-y-auto px-2 py-3 space-y-1 flex-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl p-2 text-sm font-semibold transition hover:bg-white/20 hover:translate-x-0.5 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                  : 'text-white/90'
              }`
            }
          >
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/20 p-4">
        <button
          onClick={onLogout}
          className="flex items-center gap-2 w-full rounded-lg border border-slate-300/25 px-3 py-2 text-sm font-semibold text-white hover:border-red-200 hover:bg-red-500/20"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </aside>
  );
}
