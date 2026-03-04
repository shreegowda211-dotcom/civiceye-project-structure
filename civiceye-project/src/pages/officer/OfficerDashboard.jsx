import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/common/StatsCard';
import { CheckSquare, ClipboardList, AlertTriangle, TrendingUp } from 'lucide-react';

export default function OfficerDashboard() {
  const { user } = useAuth();

  // TODO: fetch assigned issues and stats from backend
  const assignedCount = 0;
  const resolvedCount = 0;
  const pendingCount = 0;

  return (
    <DashboardLayout role="Officer">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user?.name}!</h1>
          <p className="text-muted-foreground">
            Manage assigned issues and update their status
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Assigned Issues"
            value={assignedCount}
            icon={<ClipboardList className="h-6 w-6 text-primary" />}
          />
          <StatsCard
            title="Pending"
            value={pendingCount}
            icon={<AlertTriangle className="h-6 w-6 text-status-reported" />}
          />
          <StatsCard
            title="Resolved"
            value={resolvedCount}
            icon={<CheckSquare className="h-6 w-6 text-status-resolved" />}
            variant="success"
          />
          <StatsCard
            title="Completion Rate"
            value={`${resolvedCount > 0 ? Math.round((resolvedCount / (assignedCount || 1)) * 100) : 0}%`}
            icon={<TrendingUp className="h-6 w-6 text-primary" />}
          />
        </div>

        {/* Assigned Issues */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Assigned Issues</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <p className="text-slate-500">
              {assignedCount === 0
                ? 'No issues assigned yet'
                : 'Loading assigned issues...'}
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
