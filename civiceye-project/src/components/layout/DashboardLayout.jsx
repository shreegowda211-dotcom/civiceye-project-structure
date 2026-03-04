import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  Map,
  CheckSquare,
  BarChart3,
  Users,
  Settings,
} from "lucide-react";

export default function DashboardLayout({ children, role = "Citizen" }) {
  // navigation items grouped by role
  const citizenNavItems = [
    { icon: <LayoutDashboard className="h-5 w-5" />, label: 'Dashboard', path: '/citizen' },
    { icon: <PlusCircle className="h-5 w-5" />, label: 'Report Issue', path: '/citizen/report' },
    { icon: <ClipboardList className="h-5 w-5" />, label: 'My Issues', path: '/citizen/issues' },
    { icon: <Map className="h-5 w-5" />, label: 'Track Issue', path: '/citizen/track' },
  ];

  const officerNavItems = [
    { icon: <LayoutDashboard className="h-5 w-5" />, label: 'Dashboard', path: '/officer' },
    { icon: <ClipboardList className="h-5 w-5" />, label: 'Assigned Issues', path: '/officer/issues' },
    { icon: <CheckSquare className="h-5 w-5" />, label: 'Update Status', path: '/officer/update' },
  ];

  const adminNavItems = [
    { icon: <LayoutDashboard className="h-5 w-5" />, label: 'Dashboard', path: '/admin' },
    { icon: <BarChart3 className="h-5 w-5" />, label: 'Analytics', path: '/admin/analytics' },
    { icon: <ClipboardList className="h-5 w-5" />, label: 'All Issues', path: '/admin/issues' },
    { icon: <Users className="h-5 w-5" />, label: 'Users', path: '/admin/users' },
    { icon: <Settings className="h-5 w-5" />, label: 'Departments', path: '/admin/departments' },
  ];

  let menuItems;
  switch (role.toLowerCase()) {
    case 'officer':
      menuItems = officerNavItems;
      break;
    case 'admin':
      menuItems = adminNavItems;
      break;
    default:
      menuItems = citizenNavItems;
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col bg-slate-900 text-slate-200">
        <div className="mt-8 flex flex-col space-y-1 px-4">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? "bg-slate-700 text-white"
                    : "hover:bg-slate-800 hover:text-white text-slate-300"
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="mt-auto p-4 text-xs bg-slate-800">
          <p className="font-semibold">Need Help?</p>
          <p>Call: 1800-XXX-XXXX</p>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
