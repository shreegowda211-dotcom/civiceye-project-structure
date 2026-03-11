import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Users, Mail, Calendar, Trash2, UserCheck } from 'lucide-react';

export default function AdminUsers() {
  const { user } = useAuth();

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
              Citizens Management 👥
            </h1>
            <p className="text-slate-200">
              View and manage all citizens on the platform
            </p>
          </div>
        </div>


        {/* Loading State */}
        {citizensLoading && (
          <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
            <CardContent className="py-12">
              <div className="flex justify-center items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                <p className="text-slate-600 font-medium">Loading citizens...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Citizens Table */}
        {!citizensLoading && (
          <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-t-xl">
              <CardTitle className="text-xl font-semibold">
                Citizens Management ({citizensData.length})
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
                    {citizensData.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center gap-4">
                            <Users className="h-16 w-16 text-slate-300" />
                            <p className="text-slate-600 text-lg">No citizens registered yet</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      citizensData.map((user) => (
                        <tr key={user._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-slate-900">{user.name}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-slate-400" />
                              {user.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
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
        </div>
      </div>
    </DashboardLayout>
  );
}
