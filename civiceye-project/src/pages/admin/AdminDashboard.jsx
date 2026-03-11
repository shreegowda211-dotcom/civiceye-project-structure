import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '@/services/api';
import { ClipboardList, TrendingUp, BarChart3 } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();

  // Fetch all complaints for admin dashboard
  const { data: complaintData = {}, isLoading, isError } = useQuery({
    queryKey: ['admin-complaints'],
    queryFn: async () => {
      const res = await adminAPI.getAllComplaints();
      return res.data;
    },
  });

  const allComplaints = complaintData.complaints || [];
  const totalIssues = allComplaints.length;
  const resolvedCount = allComplaints.filter((i) => i.status === 'Resolved').length;
  const resolvedRate = totalIssues > 0 ? Math.round((resolvedCount / totalIssues) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-8 bg-slate-50 p-6 rounded-lg shadow-lg">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-slate-700 via-slate-600 to-slate-800 rounded-2xl p-8 shadow-lg text-white">
          <h1 className="font-heading text-3xl font-bold mb-2">Admin Dashboard 🛡️</h1>
          <p className="text-slate-200">
            Platform overview and administration controls
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border-l-4 border-blue-500 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-semibold mb-1">Total Issues</p>
                <p className="text-3xl font-bold text-slate-900">{totalIssues}</p>
              </div>
              <ClipboardList className="h-10 w-10 text-blue-500 opacity-50" />
            </div>
          </div>
          
          <div className="bg-white border-l-4 border-emerald-500 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-semibold mb-1">Resolved</p>
                <p className="text-3xl font-bold text-slate-900">{resolvedCount}</p>
              </div>
              <TrendingUp className="h-10 w-10 text-emerald-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white border-l-4 border-purple-500 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-semibold mb-1">Resolution Rate</p>
                <p className="text-3xl font-bold text-slate-900">{resolvedRate}%</p>
              </div>
              <BarChart3 className="h-10 w-10 text-purple-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white border-l-4 border-red-500 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-semibold mb-1">Pending</p>
                <p className="text-3xl font-bold text-slate-900">{totalIssues - resolvedCount}</p>
              </div>
              <ClipboardList className="h-10 w-10 text-red-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="bg-blue-50 border-b border-blue-100 rounded-t-lg">
              <CardTitle className="text-base text-blue-700">Management Areas</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2 text-sm">
                <li className="text-slate-600">• View all issues</li>
                <li className="text-slate-600">• Manage users</li>
                <li className="text-slate-600">• Configure departments</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="bg-emerald-50 border-b border-emerald-100 rounded-t-lg">
              <CardTitle className="text-base text-emerald-700">System Status</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2 text-sm">
                <li className="text-slate-600">✅ Backend: Online</li>
                <li className="text-slate-600">✅ Database: Connected</li>
                <li className="text-slate-600">✅ API: Running</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="bg-purple-50 border-b border-purple-100 rounded-t-lg">
              <CardTitle className="text-base text-purple-700">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2 text-sm">
                <li className="text-slate-600">Total Issues: {totalIssues}</li>
                <li className="text-slate-600">Resolved: {resolvedCount}</li>
                <li className="text-slate-600">Pending: {totalIssues - resolvedCount}</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
