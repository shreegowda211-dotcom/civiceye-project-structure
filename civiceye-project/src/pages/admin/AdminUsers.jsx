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
      <div className="space-y-8 bg-slate-50 p-6 rounded-lg shadow-lg">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-slate-700 via-slate-600 to-slate-800 rounded-2xl p-8 shadow-lg text-white">
          <div>
            <h1 className="font-heading text-3xl font-bold mb-2">
              User Management 👥
            </h1>
            <p className="text-slate-200">
              View and manage citizens and officers on the platform
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('citizens')}
            className={`px-6 py-3 font-semibold border-b-2 transition-all rounded-t-lg ${
              activeTab === 'citizens'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Citizens ({citizensData.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('officers')}
            className={`px-6 py-3 font-semibold border-b-2 transition-all rounded-t-lg ${
              activeTab === 'officers'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
          <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
            <CardContent className="py-12">
              <div className="flex justify-center items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                <p className="text-slate-600 font-medium">Loading users...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Users Table */}
        {!isLoading && (
          <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-t-xl">
              <CardTitle className="text-xl font-semibold">
                {activeTab === 'citizens' ? 'Citizens' : 'Officers'} Management
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-slate-700">Name</th>
                      <th className="px-6 py-4 text-left font-semibold text-slate-700">Email</th>
                      <th className="px-6 py-4 text-left font-semibold text-slate-700">Role</th>
                      <th className="px-6 py-4 text-left font-semibold text-slate-700">Joined</th>
                      <th className="px-6 py-4 text-center font-semibold text-slate-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayData.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center gap-4">
                            {activeTab === 'citizens' ? (
                              <>
                                <Users className="h-16 w-16 text-slate-300" />
                                <p className="text-slate-600 text-lg">No citizens registered yet</p>
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-16 w-16 text-slate-300" />
                                <p className="text-slate-600 text-lg">No officers registered yet</p>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      displayData.map((user) => (
                        <tr key={user._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
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
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all border border-transparent hover:border-red-200"
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
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {/* Citizens Summary */}
          <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-xl">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Users className="h-6 w-6" />
                Citizens Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-white border-l-4 border-blue-500 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-semibold mb-1">Total Citizens</p>
                      <p className="text-2xl font-bold text-slate-900">{citizensData.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500 opacity-60" />
                  </div>
                </div>

                <div className="bg-white border-l-4 border-green-500 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-semibold mb-1">Active Citizens</p>
                      <p className="text-2xl font-bold text-slate-900">{citizensData.length}</p>
                    </div>
                    <UserCheck className="h-8 w-8 text-green-500 opacity-60" />
                  </div>
                </div>

                <div className="bg-white border-l-4 border-emerald-500 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-semibold mb-1">Joined This Month</p>
                      <p className="text-2xl font-bold text-slate-900">{citizensData.filter((c) => {
                        const joinDate = new Date(c.createdAt);
                        const now = new Date();
                        return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
                      }).length}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-emerald-500 opacity-60" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Officers Summary */}
          <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-xl">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <UserCheck className="h-6 w-6" />
                Officers Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-white border-l-4 border-green-500 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-semibold mb-1">Total Officers</p>
                      <p className="text-2xl font-bold text-slate-900">{officersData.length}</p>
                    </div>
                    <UserCheck className="h-8 w-8 text-green-500 opacity-60" />
                  </div>
                </div>

                <div className="bg-white border-l-4 border-emerald-500 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-semibold mb-1">Active Officers</p>
                      <p className="text-2xl font-bold text-slate-900">{officersData.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-emerald-500 opacity-60" />
                  </div>
                </div>

                <div className="bg-white border-l-4 border-blue-500 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-semibold mb-1">Joined This Month</p>
                      <p className="text-2xl font-bold text-slate-900">{officersData.filter((o) => {
                        const joinDate = new Date(o.createdAt);
                        const now = new Date();
                        return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
                      }).length}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-500 opacity-60" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
