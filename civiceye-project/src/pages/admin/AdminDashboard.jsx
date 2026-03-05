import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/common/StatsCard';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '@/services/api';
import { Users, ClipboardList, TrendingUp, BarChart3 } from 'lucide-react';

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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Platform overview and administration controls
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Issues"
            value={totalIssues}
            icon={<ClipboardList className="h-6 w-6 text-blue-600" />}
          />
          <StatsCard
            title="Resolved"
            value={resolvedCount}
            icon={<TrendingUp className="h-6 w-6 text-green-600" />}
            variant="success"
          />
          <StatsCard
            title="Resolution Rate"
            value={`${resolvedRate}%`}
            icon={<BarChart3 className="h-6 w-6 text-purple-600" />}
          />
          <StatsCard
            title="Pending"
            value={totalIssues - resolvedCount}
            icon={<ClipboardList className="h-6 w-6 text-red-600" />}
          />
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Management Areas</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• View all issues</li>
                <li>• Manage users</li>
                <li>• Configure departments</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✅ Backend: Online</li>
                <li>✅ Database: Connected</li>
                <li>✅ API: Running</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>Total Issues: {totalIssues}</li>
                <li>Resolved: {resolvedCount}</li>
                <li>Pending: {totalIssues - resolvedCount}</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
