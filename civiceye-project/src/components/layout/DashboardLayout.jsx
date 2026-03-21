import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "./Header";
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  Map,
  CheckSquare,
  BarChart3,
  Users,
  Settings,
  Menu,
  X,
  Plus,
  User,
  Bell,
  MessageCircle,
  AlertCircle,
  UserCheck,
} from "lucide-react";

export default function DashboardLayout({ children }) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Determine role from authenticated user
  const userRole = user?.role?.toLowerCase() || "citizen";

  // Navigation items grouped by role
  const citizenNavItems = [
    { icon: <LayoutDashboard className="h-5 w-5" />, label: "Dashboard", path: "/citizen", end: true },
    { icon: <PlusCircle className="h-5 w-5" />, label: "Report Issue", path: "/citizen/report" },
    { icon: <ClipboardList className="h-5 w-5" />, label: "My Issues", path: "/citizen/issues" },
    { icon: <Map className="h-5 w-5" />, label: "Track Issue", path: "/citizen/track" },
    { icon: <User className="h-5 w-5" />, label: "Profile", path: "/citizen/profile" },
    { icon: <Bell className="h-5 w-5" />, label: "Notifications", path: "/citizen/notifications" },
    { icon: <MessageCircle className="h-5 w-5" />, label: "Feedback", path: "/citizen/feedback" },
  ];

  const officerNavItems = [
    { icon: <LayoutDashboard className="h-5 w-5" />, label: "Dashboard", path: "/officer" },
    { icon: <ClipboardList className="h-5 w-5" />, label: "Assigned Issues", path: "/officer/issues" },
    { icon: <CheckSquare className="h-5 w-5" />, label: "Update Status", path: "/officer/update" },
  ];

  const adminNavItems = [
    { icon: <LayoutDashboard className="h-5 w-5" />, label: "Dashboard", path: "/admin" },
    { icon: <Users className="h-5 w-5" />, label: "Users", path: "/admin/all-users" },
    { icon: <Users className="h-5 w-5" />, label: "Manage Officers", path: "/admin/manage-officers" },
    { icon: <BarChart3 className="h-5 w-5" />, label: "Category Analytics", path: "/admin/categories" },
    { icon: <ClipboardList className="h-5 w-5" />, label: "All Issues", path: "/admin/issues" },
    { icon: <Map className="h-5 w-5" />, label: "Areas", path: "/admin/areas" },
    // /admin/categories route is already used by Category Analytics
    { icon: <Settings className="h-5 w-5" />, label: "Departments", path: "/admin/departments" },
    { icon: <Settings className="h-5 w-5" />, label: "Services", path: "/admin/services" },
    { icon: <Settings className="h-5 w-5" />, label: "Reports", path: "/admin/reports" },
    { icon: <AlertCircle className="h-5 w-5" />, label: "Escalations", path: "/admin/escalated" },
    { icon: <UserCheck className="h-5 w-5" />, label: "Feedback", path: "/admin/feedback" },
    { icon: <Settings className="h-5 w-5" />, label: "Settings", path: "/admin/settings" },
    { icon: <Bell className="h-5 w-5" />, label: "Help", path: "/admin/help" },
  ];

  let menuItems;
  switch (userRole) {
    case "officer":
      menuItems = officerNavItems;
      break;
    case "admin":
      menuItems = adminNavItems;
      break;
    default:
      menuItems = citizenNavItems;
  }

  

  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      {/* Header */}
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Desktop */}

        <aside
  className={`fixed left-0 top-16 bottom-0 z-40 w-64 bg-slate-900 text-slate-200 transition-transform duration-300 md:relative md:top-0 ${
    sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
  }`}
>
  <div className="flex flex-col h-full">

    {/* User Info */}
    <div className="border-b border-slate-700 px-4 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-semibold text-sm">
          {getUserInitials()}
        </div>
        <div className="hidden sm:block">
          <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
          <p className="truncate text-xs text-slate-400 capitalize">{user?.role}</p>
        </div>
      </div>
    </div>

    {/* Navigation Items */}
    <nav className="flex flex-col space-y-1 px-3 py-4 flex-grow">
      {menuItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
              isActive
                ? "bg-emerald-600 text-white shadow-md"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`
          }
          onClick={() => setSidebarOpen(false)}
        >
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>

    {/* Help Section at Bottom */}
    <div className="border-t border-slate-700 p-3 text-xs text-slate-400">
      <p className="font-semibold text-slate-300">Need Help?</p>
      <p className="mt-1">Call: 1800-XXX-XXXX</p>
    </div>

  </div>
</aside>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-6">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mb-4 md:hidden rounded-lg bg-slate-900 p-2 text-white hover:bg-slate-800"
            >
              {sidebarOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
