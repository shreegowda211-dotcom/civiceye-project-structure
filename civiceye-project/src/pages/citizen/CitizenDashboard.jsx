import React from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/common/StatsCard';
import { IssueCard } from '@/components/common/IssueCard';
import { useQuery } from '@tanstack/react-query';
import { citizenAPI } from '@/services/api';
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

  // Fetch user's complaints from backend
  const { data: userComplaints = [], isLoading, isError, error } = useQuery({
    queryKey: ['complaints', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await citizenAPI.getAllComplaints();
      return res.data.complaints || [];
    },
    enabled: !!user,
  });

  const resolvedCount = userComplaints.filter((i) => i.status === 'Resolved').length;
  const inProgressCount = userComplaints.filter((i) => i.status === 'In Progress').length;
  const pendingCount = userComplaints.filter((i) => i.status === 'Pending').length;

  return (
    <DashboardLayout>
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
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
              <PlusCircle className="h-5 w-5" />
              Report New Issue
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Reported"
            value={userComplaints.length}
            icon={<FileText className="h-6 w-6 text-primary" />}
          />
          <StatsCard
            title="In Progress"
            value={inProgressCount}
            icon={<Clock className="h-6 w-6 text-yellow-500" />}
            variant="warning"
          />
          <StatsCard
            title="Resolved"
            value={resolvedCount}
            icon={<CheckCircle2 className="h-6 w-6 text-green-500" />}
            variant="success"
          />
          <StatsCard
            title="Pending"
            value={pendingCount}
            icon={<AlertTriangle className="h-6 w-6 text-red-500" />}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Link to="/citizen/report">
            <Card className="shadow-card hover:shadow-md transition-all cursor-pointer group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
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
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">My Issues</h3>
                  <p className="text-sm text-muted-foreground">View all your reports</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card className="shadow-card">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <ArrowRight className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Resolution Rate</h3>
                <p className="text-sm text-muted-foreground">
                  {userComplaints.length > 0 
                    ? `${Math.round((resolvedCount / userComplaints.length) * 100)}%` 
                    : '0%'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Issues */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Your Recent Issues</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="text-center py-8">
                <p className="text-slate-500">Loading your issues...</p>
              </div>
            )}
            
            {isError && (
              <div className="text-center py-8">
                <p className="text-red-500">Error loading issues: {error?.message}</p>
              </div>
            )}

            {!isLoading && !isError && userComplaints.length === 0 && (
              <div className="text-center py-8">
                <p className="text-slate-500">No issues reported yet. Start by filing a complaint!</p>
                <Link to="/citizen/report">
                  <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700">Report First Issue</Button>
                </Link>
              </div>
            )}

            {!isLoading && !isError && userComplaints.length > 0 && (
              <div className="space-y-4">
                {userComplaints.slice(0, 5).map((issue) => (
                  <IssueCard key={issue._id} issue={issue} />
                ))}
                {userComplaints.length > 5 && (
                  <Link to="/citizen/issues">
                    <Button variant="ghost" className="w-full">View All Issues</Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
