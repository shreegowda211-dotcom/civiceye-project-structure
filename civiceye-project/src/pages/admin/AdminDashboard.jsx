import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/common/StatsCard';
import { Users, ClipboardList, TrendingUp, BarChart3 } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();

  // TODO: fetch admin stats from backend
  const totalUsers = 0;
  const totalIssues = 0;
  const resolvedRate = 0;

  return (
    <DashboardLayout role="Admin">
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
            icon={<ClipboardList className="h-6 w-6 text-primary" />}
          />
          <StatsCard
            title="Total Users"
            value={totalUsers}
            icon={<Users className="h-6 w-6 text-primary" />}
          />
          <StatsCard
            title="Resolution Rate"
            value={`${resolvedRate}%`}
            icon={<TrendingUp className="h-6 w-6 text-status-resolved" />}
            variant="success"
          />
          <StatsCard
            title="Analytics"
            value="View"
            icon={<BarChart3 className="h-6 w-6 text-primary" />}
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
        </div>
      </div>
    </DashboardLayout>
  );
}
