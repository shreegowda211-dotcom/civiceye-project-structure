import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { citizenAPI } from '@/services/api';
import { safeQuery } from '@/lib/safeQuery';
import { Button } from '@/components/ui/button';
import { Shield, User, LogOut, Bell, Menu, X } from 'lucide-react';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { data: notifications = [], isLoading: isNotifLoading } = useQuery({
    queryKey: ['citizen-notifications', user?.id],
    queryFn: safeQuery(() => citizenAPI.getNotifications().then((res) => res.data.data), []),
    enabled: !!user && user.role?.toLowerCase() === 'citizen',
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000,
  });

  const unreadCount = (notifications || []).filter((note) => !note.read).length;

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    switch (user.role?.toLowerCase()) {
      case 'citizen': return '/citizen';
      case 'officer': return '/officer';
      case 'admin': return '/admin';
      default: return '/';
    }
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6 lg:px-8">
        {/* Logo */}
        <Link 
          to={isAuthenticated ? getDashboardPath() : '/'} 
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-slate-900 to-slate-800">
            <Shield className="h-6 w-6 text-emerald-400" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-lg text-slate-900">CivicEye</h1>
            <p className="text-xs text-slate-500">Smart Issue Reporting</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <button
                className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
                onClick={() => navigate('/citizen/notifications')}
              >
                <Bell className="h-5 w-5 text-slate-600" />
                {!isNotifLoading && unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-black">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-black text-sm font-semibold">
                    {getUserInitials()}
                  </div>
                  <div className="hidden text-left lg:block">
                    <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
                    <div className="px-4 py-3 border-b border-slate-200">
                      <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                      <p className="text-xs text-slate-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        navigate(getDashboardPath());
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                    >
                      <User className="h-4 w-4" />
                      Dashboard
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors border-t border-slate-200"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-slate-900 text-black hover:bg-slate-800">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-slate-600" />
          ) : (
            <Menu className="h-6 w-6 text-slate-600" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="px-4 py-4 space-y-3">
            {isAuthenticated ? (
              <>
                <div className="px-3 py-2 bg-slate-50 rounded-lg mb-3">
                  <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                  <p className="text-xs text-slate-600 capitalize mt-1">Role: {user?.role}</p>
                </div>
                <button
                  onClick={() => {
                    navigate(getDashboardPath());
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">Login</Button>
                </Link>
                <Link to="/register" className="block" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full justify-start bg-slate-900 text-white hover:bg-slate-800">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

