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
      <div className="space-y-8">
        {/* Welcome Header with Gradient */}
        <div className="bg-gradient-to-r from-slate-700 via-slate-600 to-slate-800 rounded-2xl p-8 shadow-lg text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-heading text-4xl font-bold mb-2">
                Welcome back, {user?.name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-slate-200 text-lg">
                Track your reported issues and submit new complaints
              </p>
            </div>
            <Link to="/citizen/report">
              <Button className="gap-2 bg-white text-slate-700 hover:bg-slate-50 font-semibold shadow-lg">
                <PlusCircle className="h-5 w-5" />
                Report New Issue
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border-l-4 border-blue-500 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-semibold mb-1">Total Reported</p>
                <p className="text-3xl font-bold text-slate-900">{userComplaints.length}</p>
              </div>
              <FileText className="h-10 w-10 text-blue-500 opacity-50" />
            </div>
          </div>
          
          <div className="bg-white border-l-4 border-amber-500 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-semibold mb-1">In Progress</p>
                <p className="text-3xl font-bold text-slate-900">{inProgressCount}</p>
              </div>
              <Clock className="h-10 w-10 text-amber-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white border-l-4 border-emerald-500 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-semibold mb-1">Resolved</p>
                <p className="text-3xl font-bold text-slate-900">{resolvedCount}</p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-emerald-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white border-l-4 border-red-500 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-semibold mb-1">Pending</p>
                <p className="text-3xl font-bold text-slate-900">{pendingCount}</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-red-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Link to="/citizen/report">
            <Card className="bg-white border-t-4 border-emerald-500 shadow-md hover:shadow-xl transition-all cursor-pointer group h-full">
              <CardContent className="p-6 flex items-center gap-4 h-full">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 shadow-md group-hover:scale-110 transition-transform">
                  <PlusCircle className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-lg">Report Issue</h3>
                  <p className="text-sm text-slate-600">Submit a new complaint</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/citizen/issues">
            <Card className="bg-white border-t-4 border-blue-500 shadow-md hover:shadow-xl transition-all cursor-pointer group h-full">
              <CardContent className="p-6 flex items-center gap-4 h-full">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-blue-100 text-blue-600 shadow-md group-hover:scale-110 transition-transform">
                  <FileText className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-lg">My Issues</h3>
                  <p className="text-sm text-slate-600">View all your reports</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card className="bg-white border-t-4 border-slate-700 shadow-md hover:shadow-xl transition-all h-full">
            <CardContent className="p-6 flex items-center gap-4 h-full">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-200 text-slate-700 shadow-md">
                <ArrowRight className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-lg">Resolution Rate</h3>
                <p className="text-lg font-bold text-slate-700">
                  {userComplaints.length > 0 
                    ? `${Math.round((resolvedCount / userComplaints.length) * 100)}%` 
                    : '0%'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Issues */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-slate-700 text-white rounded-t-lg">
            <CardTitle className="text-2xl">Your Recent Issues</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading && (
              <div className="text-center py-12">
                <div className="inline-block">
                  <div className="h-8 w-8 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin"></div>
                </div>
                <p className="text-slate-500 mt-4">Loading your issues...</p>
              </div>
            )}
            
            {isError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-600 font-semibold">Error loading issues: {error?.message}</p>
              </div>
            )}

            {!isLoading && !isError && userComplaints.length === 0 && (
              <div className="text-center py-12 bg-slate-50 rounded-lg">
                <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 text-lg mb-6">No issues reported yet. Start by filing a complaint!</p>
                <Link to="/citizen/report">
                  <Button className="bg-slate-700 hover:bg-slate-800 text-white font-semibold">Report First Issue</Button>
                </Link>
              </div>
            )}

            {!isLoading && !isError && userComplaints.length > 0 && (
              <div className="space-y-4">
                {userComplaints.slice(0, 5).map((issue) => (
                  <div key={issue._id} className="border-l-4 border-slate-600 bg-slate-50 p-4 rounded-r-lg hover:shadow-md transition-shadow">
                    <IssueCard issue={issue} />
                  </div>
                ))}
                {userComplaints.length > 5 && (
                  <Link to="/citizen/issues">
                    <Button variant="outline" className="w-full border-2 border-slate-600 text-slate-700 hover:bg-slate-100 font-semibold">View All Issues</Button>
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
