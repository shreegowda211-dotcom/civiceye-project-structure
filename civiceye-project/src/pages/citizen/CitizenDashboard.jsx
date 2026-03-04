import React from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/common/StatsCard';
import { IssueCard } from '@/components/common/IssueCard';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  PlusCircle,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

export default function CitizenDashboard() {
  const { user } = useAuth();

  // fetch user's issues from backend
  const { data: userIssues = [], isLoading, isError } = useQuery({
    queryKey: ['issues', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await axios.get(`http://localhost:7000/api/issues?reportedBy=${user.id}`);
      return res.data;
    },
    enabled: !!user,
  });

  const resolvedCount = userIssues.filter((i) => i.status === 'resolved').length;
  const inProgressCount = userIssues.filter((i) => i.status === 'in-progress').length;
  const pendingCount = userIssues.filter((i) => i.status !== 'resolved' && i.status !== 'in-progress').length;

  return (
    <DashboardLayout role="Citizen">
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold">
              Welcome back, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-muted-foreground">
              Track your reported issues and submit new complaints
            </p>
          </div>
          <Link to="/citizen/report">
            <Button variant="civic" className="gap-2">
              <PlusCircle className="h-5 w-5" />
              Report New Issue
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Reported"
            value={userIssues.length}
            icon={<FileText className="h-6 w-6 text-primary" />}
          />
          <StatsCard
            title="In Progress"
            value={inProgressCount}
            icon={<Clock className="h-6 w-6 text-status-in-progress" />}
            variant="warning"
          />
          <StatsCard
            title="Resolved"
            value={resolvedCount}
            icon={<CheckCircle2 className="h-6 w-6 text-status-resolved" />}
            variant="success"
          />
          <StatsCard
            title="Pending"
            value={pendingCount}
            icon={<AlertTriangle className="h-6 w-6 text-status-reported" />}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Link to="/citizen/report">
            <Card className="shadow-card hover:shadow-md transition-all cursor-pointer group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                  <PlusCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Report Issue</h3>
                  <p className="text-sm text-muted-foreground">Submit a new complaint</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/citizen/issues">
            <Card className="shadow-card hover:shadow-md transition-all cursor-pointer group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">My Issues</h3>
                  <p className="text-sm text-muted-foreground">View all reported issues</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/citizen/track">
            <Card className="shadow-card hover:shadow-md transition-all cursor-pointer group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-status-assigned/10 text-status-assigned group-hover:bg-status-assigned group-hover:text-white transition-colors">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Track Status</h3>
                  <p className="text-sm text-muted-foreground">Monitor issue progress</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Issues */}
        {isLoading && <p className="text-sm text-slate-500">Loading recent issues...</p>}
        {isError && <p className="text-sm text-red-600">Failed to load issues.</p>}
        {userIssues.length > 0 && (
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-heading">Recent Issues</CardTitle>
              <Link to="/citizen/issues">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {userIssues.slice(0, 3).map((issue) => (
                  <IssueCard key={issue.id} issue={issue} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
