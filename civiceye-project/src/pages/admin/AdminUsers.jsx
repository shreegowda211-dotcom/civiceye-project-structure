import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Users, UserCheck, Mail, Calendar, Trash2 } from 'lucide-react';

export default function AdminUsers() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('citizens');

  // Fetch all citizens
  const { data: citizensData = [], isLoading: citizensLoading } = useQuery({
    queryKey: ['admin-citizens'],
    queryFn: async () => {
      const token = localStorage.getItem('civiceye_token');
      const res = await axios.get('http://localhost:7000/api/admin/citizens', {
        headers: {
          'auth-token': token
        }
      });
      return res.data.data || [];
    },
  });

  // Fetch all officers
  const { data: officersData = [], isLoading: officersLoading } = useQuery({
    queryKey: ['admin-officers'],
    queryFn: async () => {
      const token = localStorage.getItem('civiceye_token');
      const res = await axios.get('http://localhost:7000/api/admin/officers', {
        headers: {
          'auth-token': token
        }
      });
      return res.data.data || [];
    },
  });

  const isLoading = activeTab === 'citizens' ? citizensLoading : officersLoading;
  const displayData = activeTab === 'citizens' ? citizensData : officersData;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            View and manage citizens and officers on the platform
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('citizens')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'citizens'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Citizens ({citizensData.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('officers')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'officers'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Officers ({officersData.length})
            </div>
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Users Table */}
        {!isLoading && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border border-slate-200">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Joined</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-slate-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {displayData.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        {activeTab === 'citizens' ? (
                          <>
                            <Users className="h-12 w-12 text-slate-300" />
                            <p>No citizens registered yet</p>
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-12 w-12 text-slate-300" />
                            <p>No officers registered yet</p>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayData.map((user) => (
                    <tr key={user._id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{user.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-slate-400" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          activeTab === 'citizens'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid md:grid-cols-2 gap-4 mt-8">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Citizens Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ Total Citizens: <span className="font-bold">{citizensData.length}</span></li>
                <li>✓ Active: <span className="font-bold">{citizensData.length}</span></li>
                <li>✓ Joined this month: <span className="font-bold">{citizensData.filter((c) => {
                  const joinDate = new Date(c.createdAt);
                  const now = new Date();
                  return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
                }).length}</span></li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-green-600" />
                Officers Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ Total Officers: <span className="font-bold">{officersData.length}</span></li>
                <li>✓ Active: <span className="font-bold">{officersData.length}</span></li>
                <li>✓ Joined this month: <span className="font-bold">{officersData.filter((o) => {
                  const joinDate = new Date(o.createdAt);
                  const now = new Date();
                  return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
                }).length}</span></li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
