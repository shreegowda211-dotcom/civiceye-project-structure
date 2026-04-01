import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, GradientCard } from '@/components/ui/card';
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
        <div className="bg-gradient-to-r from-slate-700 via-slate-600 to-slate-800 rounded-2xl p-8 shadow-lg text-black">
          <h1 className="font-heading text-3xl font-bold mb-2">Admin Dashboard 🛡️</h1>
          <p className="text-slate-200">
            Platform overview and administration controls
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <GradientCard title="Total Issues" description={`${totalIssues} reported`}>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-4xl font-bold text-white">{totalIssues}</p>
              <ClipboardList className="h-10 w-10 text-white/50" />
            </div>
          </GradientCard>
          
          <GradientCard title="Resolved" description={`${resolvedCount} completed`}>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-4xl font-bold text-white">{resolvedCount}</p>
              <TrendingUp className="h-10 w-10 text-white/50" />
            </div>
          </GradientCard>

          <GradientCard title="Resolution Rate" description={`${resolvedRate}% complete`}>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-4xl font-bold text-white">{resolvedRate}%</p>
              <BarChart3 className="h-10 w-10 text-white/50" />
            </div>
          </GradientCard>

          <GradientCard title="Pending" description={`${totalIssues - resolvedCount} awaiting`}>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-4xl font-bold text-white">{totalIssues - resolvedCount}</p>
              <ClipboardList className="h-10 w-10 text-white/50" />
            </div>
          </GradientCard>
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
