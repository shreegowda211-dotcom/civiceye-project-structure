import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { useQuery } from '@tanstack/react-query';
import { officerAPI } from '@/services/api';
import {
  CheckSquare,
  ClipboardList,
  AlertTriangle,
  Zap,
  Eye,
  Pencil,
  Calendar,
  Briefcase,
  Loader,
  AlertCircle,
} from 'lucide-react';

export default function OfficerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch assigned complaints from backend
  const { data: complaintData = { complaints: [] }, isLoading, isError, error } = useQuery({
    queryKey: ['officer-complaints', user?.id],
    queryFn: async () => {
      if (!user) return { complaints: [] };
      const res = await officerAPI.getAssignedComplaints();
      return res.data;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get complaints array safely
  const allComplaints = complaintData?.complaints || [];

  // Calculate stats from real data
  const assignedCount = allComplaints.length;
  const resolvedCount = allComplaints.filter((i) => i.status === 'Resolved').length;
  const pendingCount = allComplaints.filter((i) => i.status === 'Pending').length;
  const inProgressCount = allComplaints.filter((i) => i.status === 'In Progress').length;

  // Utility function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6 space-y-8">
        
        {/* ========== WELCOME HEADER ========== */}
        <div className="bg-gradient-to-r from-slate-700 via-slate-600 to-slate-800 rounded-3xl p-8 shadow-xl text-white backdrop-blur-xl border border-slate-600/20">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome, {user?.name || 'Officer'}! 👮
            </h1>
            <p className="text-slate-200 text-lg">
              Manage assigned issues and track resolution progress
            </p>
          </div>
        </div>

        {/* ========== SUMMARY CARDS ========== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Assigned Complaints */}
          <div className="group relative bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:bg-white/90 transition-all duration-300 cursor-default">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-semibold mb-1">Assigned Issues</p>
                  <p className="text-4xl font-bold text-slate-900">{assignedCount}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <ClipboardList className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="h-1 w-16 bg-blue-500 rounded-full"></div>
            </div>
          </div>

          {/* Card 2: Pending Complaints */}
          <div className="group relative bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:bg-white/90 transition-all duration-300 cursor-default">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-semibold mb-1">Pending Issues</p>
                  <p className="text-4xl font-bold text-slate-900">{pendingCount}</p>
                </div>
                <div className="bg-amber-100 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <div className="h-1 w-16 bg-amber-500 rounded-full"></div>
            </div>
          </div>

          {/* Card 3: In Progress Complaints */}
          <div className="group relative bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:bg-white/90 transition-all duration-300 cursor-default">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-semibold mb-1">In Progress</p>
                  <p className="text-4xl font-bold text-slate-900">{inProgressCount}</p>
                </div>
                <div className="bg-indigo-100 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <Zap className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
              <div className="h-1 w-16 bg-indigo-500 rounded-full"></div>
            </div>
          </div>

          {/* Card 4: Resolved Complaints */}
          <div className="group relative bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:bg-white/90 transition-all duration-300 cursor-default">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-semibold mb-1">Resolved Issues</p>
                  <p className="text-4xl font-bold text-slate-900">{resolvedCount}</p>
                </div>
                <div className="bg-emerald-100 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <CheckSquare className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <div className="h-1 w-16 bg-emerald-500 rounded-full"></div>
            </div>
          </div>

        </div>

        {/* ========== QUICK ACTIONS SECTION ========== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Quick Action 1: View Assigned Issues */}
          <button 
            onClick={() => navigate('/officer/issues')}
            className="group relative bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-lg hover:shadow-xl hover:bg-white/90 transition-all duration-300 text-left overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent group-hover:from-blue-500/10 transition-all"></div>
            <div className="relative space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-4 rounded-xl group-hover:scale-110 transition-transform">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">View Assigned Issues</h3>
                  <p className="text-sm text-slate-600">Browse and manage all complaints assigned to you</p>
                </div>
              </div>
              <div className="flex items-center text-blue-600 font-semibold group-hover:gap-3 transition-all">
                View All
                <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </button>

          {/* Quick Action 2: Update Complaint Status */}
          <button 
            onClick={() => navigate('/officer/update')}
            className="group relative bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-lg hover:shadow-xl hover:bg-white/90 transition-all duration-300 text-left overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent group-hover:from-emerald-500/10 transition-all"></div>
            <div className="relative space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-100 p-4 rounded-xl group-hover:scale-110 transition-transform">
                  <Pencil className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Update Status</h3>
                  <p className="text-sm text-slate-600">Update the status of any complaint quickly</p>
                </div>
              </div>
              <div className="flex items-center text-emerald-600 font-semibold group-hover:gap-3 transition-all">
                Update Now
                <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </button>

        </div>

        {/* ========== RECENT ASSIGNED COMPLAINTS TABLE ========== */}
        <Card className="shadow-xl border-0 overflow-hidden bg-white/80 backdrop-blur-lg">
          <CardHeader className="bg-gradient-to-r from-slate-700 via-slate-600 to-slate-800 text-white px-8 py-6">
            <div className="flex items-center gap-3">
              <Briefcase className="h-6 w-6" />
              <CardTitle className="text-2xl">Recent Assigned Complaints</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader className="h-8 w-8 text-slate-600 animate-spin mr-3" />
                <p className="text-slate-600 font-semibold">Loading assigned complaints...</p>
              </div>
            )}

            {/* Error State */}
            {isError && (
              <div className="flex items-center gap-4 bg-red-50 border border-red-200 rounded-lg p-6 m-6">
                <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-900">Error Loading Complaints</p>
                  <p className="text-sm text-red-700">{error?.message || 'Failed to fetch assigned complaints. Please try again.'}</p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !isError && assignedCount === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ClipboardList className="h-12 w-12 text-slate-300 mb-4" />
                <p className="text-slate-600 font-semibold text-lg">No Complaints Assigned</p>
                <p className="text-slate-500 text-sm mt-1">You don't have any complaints assigned to you yet</p>
              </div>
            )}

            {/* Table */}
            {!isLoading && !isError && assignedCount > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-slate-200 bg-slate-50/80 backdrop-blur-sm">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Complaint ID</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Title</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Category</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Priority</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Reported</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allComplaints.map((complaint) => (
                      <tr
                        key={complaint._id}
                        className="hover:bg-blue-50/50 transition-colors duration-200 group"
                      >
                        <td className="px-6 py-4">
                          <span className="font-mono font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg text-sm">
                            {complaint.issueId}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900 line-clamp-2">{complaint.title}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-slate-600">{complaint.category}</p>
                        </td>
                        <td className="px-6 py-4">
                          <PriorityBadge priority={complaint.priority} />
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={complaint.status} />
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-slate-600 flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            {formatDate(complaint.createdAt)}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 gap-2 inline-flex items-center"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
}
