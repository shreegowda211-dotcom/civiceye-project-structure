import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IssueCard } from '@/components/common/IssueCard';
import { StatsCard } from '@/components/common/StatsCard';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  PlusCircle,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Filter,
  ArrowLeft,
} from 'lucide-react';

export default function AllIssues() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('All');

  // Fetch all complaints from backend
  const { data: userComplaints = [], isLoading, isError, error } = useQuery({
    queryKey: ['all-complaints', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const token = localStorage.getItem('civiceye_token');
      const res = await axios.get('http://localhost:7000/api/citizen/complaints', {
        headers: {
          'auth-token': token
        }
      });
      return res.data.complaints || [];
    },
    enabled: !!user,
  });

  const resolvedCount = userComplaints.filter((i) => i.status === 'Resolved').length;
  const inProgressCount = userComplaints.filter((i) => i.status === 'In Progress').length;
  const pendingCount = userComplaints.filter((i) => i.status === 'Pending').length;
  const rejectedCount = userComplaints.filter((i) => i.status === 'Rejected').length;

  // Filter complaints based on selected status
  const filteredComplaints = statusFilter === 'All'
    ? userComplaints
    : userComplaints.filter((c) => c.status === statusFilter);

  const statusOptions = [
    { label: 'All', icon: <FileText className="h-4 w-4" /> },
    { label: 'Pending', icon: <AlertTriangle className="h-4 w-4" />, color: 'text-blue-600' },
    { label: 'In Progress', icon: <Clock className="h-4 w-4" />, color: 'text-yellow-600' },
    { label: 'Resolved', icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-green-600' },
    { label: 'Rejected', icon: <AlertTriangle className="h-4 w-4" />, color: 'text-red-600' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Issues</h1>
            <p className="text-muted-foreground">
              View all your reported issues and track their status
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate('/citizen')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={() => navigate('/citizen/report')}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              <PlusCircle className="h-4 w-4" />
              Report New
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <StatsCard
            title="Total"
            value={userComplaints.length}
            icon={<FileText className="h-5 w-5 text-slate-600" />}
          />
          <StatsCard
            title="Pending"
            value={pendingCount}
            icon={<AlertTriangle className="h-5 w-5 text-blue-600" />}
          />
          <StatsCard
            title="In Progress"
            value={inProgressCount}
            icon={<Clock className="h-5 w-5 text-yellow-600" />}
            variant="warning"
          />
          <StatsCard
            title="Resolved"
            value={resolvedCount}
            icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
            variant="success"
          />
          <StatsCard
            title="Rejected"
            value={rejectedCount}
            icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
          />
        </div>

        {/* Filter Section */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.label}
                  onClick={() => setStatusFilter(option.label)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    statusFilter === option.label
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {option.icon}
                  {option.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card className="shadow-card">
            <CardContent className="py-12">
              <div className="flex justify-center items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                <p className="text-slate-600">Loading your issues...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {isError && (
          <Card className="shadow-card border border-red-200 bg-red-50">
            <CardContent className="py-6">
              <p className="text-red-700">
                <span className="font-semibold">Error:</span> {error?.message || 'Failed to load issues'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !isError && userComplaints.length === 0 && (
          <Card className="shadow-card">
            <CardContent className="py-12 text-center">
              <FileText className="h-16 w-16 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 mb-4">No issues reported yet</p>
              <Button
                onClick={() => navigate('/citizen/report')}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Report Your First Issue
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Issues Grid */}
        {!isLoading && !isError && filteredComplaints.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-600">
              Showing {filteredComplaints.length} issue{filteredComplaints.length !== 1 ? 's' : ''} {statusFilter !== 'All' && `(${statusFilter})`}
            </p>
            <div className="grid gap-4">
              {filteredComplaints.map((issue) => (
                <div
                  key={issue._id}
                  className="cursor-pointer transition-transform hover:scale-[1.02]"
                  onClick={() => navigate(`/citizen/track/${issue._id}`)}
                >
                  <IssueCard
                    issue={issue}
                    showActions={true}
                    onViewDetails={() => navigate(`/citizen/track/${issue._id}`)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results for Filter */}
        {!isLoading && !isError && userComplaints.length > 0 && filteredComplaints.length === 0 && (
          <Card className="shadow-card">
            <CardContent className="py-8 text-center">
              <AlertTriangle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">
                No issues with status: <span className="font-semibold">{statusFilter}</span>
              </p>
              <Button
                variant="ghost"
                onClick={() => setStatusFilter('All')}
                className="mt-4"
              >
                View All Issues
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
