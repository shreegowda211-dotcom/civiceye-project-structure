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
            icon={<ClipboardList className="h-6 w-6 text-blue-600" />}
          />
          <StatsCard
            title="Pending"
            value={pendingCount}
            icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
          />
          <StatsCard
            title="In Progress"
            value={inProgressCount}
            icon={<ClipboardList className="h-6 w-6 text-yellow-600" />}
            variant="warning"
          />
          <StatsCard
            title="Resolved"
            value={resolvedCount}
            icon={<CheckSquare className="h-6 w-6 text-green-600" />}
            variant="success"
          />
        </div>

        {/* Assigned Issues Table */}
        <Card className="shadow-card">
          <CardHeader>
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
                            className="flex items-center gap-2"
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
            <Card className="w-full max-w-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle>Update Issue Status</CardTitle>
                <button
                  onClick={() => {
                    setSelectedComplaint(null);
                    setNewStatus('');
                  }}
                  className="rounded-md p-1 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Issue ID</label>
                  <p className="font-mono font-semibold text-blue-600">{selectedComplaint.issueId}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <p className="font-medium">{selectedComplaint.title}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Status</label>
                  <StatusBadge status={selectedComplaint.status} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="status-select" className="text-sm font-medium">
                    New Status
                  </label>
                  <select
                    id="status-select"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select status...</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleUpdateStatus}
                    disabled={!newStatus || updateStatusMutation.isPending}
                    className="flex-1"
                  >
                    {updateStatusMutation.isPending ? 'Updating...' : 'Update Status'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedComplaint(null);
                      setNewStatus('');
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
                {updateStatusMutation.isError && (
                  <p className="text-sm text-red-600">Error updating status. Please try again.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
