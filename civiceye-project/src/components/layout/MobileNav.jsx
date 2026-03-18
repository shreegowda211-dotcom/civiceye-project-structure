import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, ClipboardList, Bell, User } from 'lucide-react';

const mobileItems = [
  { icon: <LayoutDashboard className="h-5 w-5" />, path: '/citizen/dashboard', label: 'Dashboard' },
  { icon: <PlusCircle className="h-5 w-5" />, path: '/citizen/report', label: 'Report' },
  { icon: <ClipboardList className="h-5 w-5" />, path: '/citizen/issues', label: 'Complaints' },
  { icon: <Bell className="h-5 w-5" />, path: '/citizen/notifications', label: 'Notifs' },
  { icon: <User className="h-5 w-5" />, path: '/citizen/profile', label: 'Profile' },
];

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/20 bg-white/90 backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-5xl justify-around px-2 py-2">
        {mobileItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition ${
                isActive ? 'text-blue-600' : 'text-slate-600 hover:text-blue-500'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
