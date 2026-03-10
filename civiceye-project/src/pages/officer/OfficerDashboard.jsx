import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/common/StatsCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { officerAPI } from '@/services/api';
import { CheckSquare, ClipboardList, AlertTriangle, Edit2, X } from 'lucide-react';

export default function OfficerDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  // Fetch all complaints for officer's department
  const { data: complaintData, isLoading, isError } = useQuery({
    queryKey: ['officer-complaints', user?.id],
    queryFn: async () => {
      if (!user) return { complaints: [] };
      const res = await officerAPI.getAssignedComplaints();
      return res.data;
    },
    enabled: !!user,
  });

  const allComplaints = complaintData?.complaints || [];

  // Mutation for updating complaint status
  const updateStatusMutation = useMutation({
    mutationFn: (data) => officerAPI.updateComplaintStatus(data.complaintId, data.status),
    onSuccess: () => {
      queryClient.invalidateQueries(['officer-complaints']);
      setSelectedComplaint(null);
      setNewStatus('');
    },
  });

  const handleUpdateStatus = () => {
    if (!selectedComplaint || !newStatus) return;
    updateStatusMutation.mutate({
      complaintId: selectedComplaint.issueId,
      status: newStatus,
    });
  };

  const assignedCount = allComplaints.length;
  const resolvedCount = allComplaints.filter((i) => i.status === 'Resolved').length;
  const pendingCount = allComplaints.filter((i) => i.status === 'Pending').length;
  const inProgressCount = allComplaints.filter((i) => i.status === 'In Progress').length;

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
      <div className="space-y-8 bg-slate-50 p-6 rounded-lg shadow-lg">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-slate-700 via-slate-600 to-slate-800 rounded-2xl p-8 shadow-lg text-white">
          <div>
            <h1 className="font-heading text-3xl font-bold mb-2">
              Welcome, {user?.name}! 👮
            </h1>
            <p className="text-slate-200">
              Manage assigned issues and update their status
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border-l-4 border-blue-500 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-semibold mb-1">Assigned Issues</p>
                <p className="text-3xl font-bold text-slate-900">{assignedCount}</p>
              </div>
              <ClipboardList className="h-10 w-10 text-blue-500 opacity-50" />
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

          <div className="bg-white border-l-4 border-amber-500 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-semibold mb-1">In Progress</p>
                <p className="text-3xl font-bold text-slate-900">{inProgressCount}</p>
              </div>
              <ClipboardList className="h-10 w-10 text-amber-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white border-l-4 border-emerald-500 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-semibold mb-1">Resolved</p>
                <p className="text-3xl font-bold text-slate-900">{resolvedCount}</p>
              </div>
              <CheckSquare className="h-10 w-10 text-emerald-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Assigned Issues Table */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-slate-700 text-white rounded-t-lg">
            <CardTitle>Assigned Issues</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && <p className="text-center text-slate-500 py-8">Loading assigned issues...</p>}
            {isError && <p className="text-center text-red-500 py-8">Error loading issues</p>}
            {!isLoading && assignedCount === 0 && (
              <p className="text-center text-slate-500 py-8">No issues assigned yet</p>
            )}
            {!isLoading && assignedCount > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Issue ID</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Title</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Category</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Priority</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Reported</th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allComplaints.map((complaint) => (
                      <tr key={complaint._id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono font-semibold text-blue-600">{complaint.issueId}</td>
                        <td className="px-4 py-3 font-medium">{complaint.title}</td>
                        <td className="px-4 py-3 text-slate-600">{complaint.category}</td>
                        <td className="px-4 py-3">
                          <PriorityBadge priority={complaint.priority} />
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={complaint.status} />
                        </td>
                        <td className="px-4 py-3 text-slate-600">{formatDate(complaint.createdAt)}</td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedComplaint(complaint);
                              setNewStatus(complaint.status);
                            }}
                            className="flex items-center gap-2 border-slate-300 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 font-semibold px-4 py-2 rounded-lg transition-all"
                          >
                            <Edit2 className="h-4 w-4" />
                            Update
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

        {/* Update Status Modal */}
        {selectedComplaint && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md shadow-lg border-0 bg-white rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-t-xl">
                <div className="flex flex-row items-center justify-between space-y-0 pb-0">
                  <CardTitle className="text-xl font-semibold">Update Issue Status</CardTitle>
                  <button
                    onClick={() => {
                      setSelectedComplaint(null);
                      setNewStatus('');
                    }}
                    className="rounded-md p-2 hover:bg-white/20 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">Issue ID</label>
                  <p className="font-mono font-semibold text-blue-600 bg-slate-50 px-3 py-2 rounded-lg">{selectedComplaint.issueId}</p>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">Title</label>
                  <p className="font-medium text-slate-900 bg-slate-50 px-3 py-2 rounded-lg">{selectedComplaint.title}</p>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">Current Status</label>
                  <div className="bg-slate-50 px-3 py-2 rounded-lg">
                    <StatusBadge status={selectedComplaint.status} />
                  </div>
                </div>
                <div className="space-y-3">
                  <label htmlFor="status-select" className="text-sm font-semibold text-slate-700">
                    New Status
                  </label>
                  <select
                    id="status-select"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-4 py-3 bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  >
                    <option value="">Select status...</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div className="flex gap-4 pt-6">
                  <Button
                    onClick={handleUpdateStatus}
                    disabled={!newStatus || updateStatusMutation.isPending}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateStatusMutation.isPending ? 'Updating...' : 'Update Status'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedComplaint(null);
                      setNewStatus('');
                    }}
                    className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold px-6 py-3 rounded-lg transition-all"
                  >
                    Cancel
                  </Button>
                </div>
                {updateStatusMutation.isError && (
                  <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">Error updating status. Please try again.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
