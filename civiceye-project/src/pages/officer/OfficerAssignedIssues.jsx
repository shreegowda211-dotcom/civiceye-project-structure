import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { officerAPI } from '@/services/api';
import {
  Search,
  Filter,
  Briefcase,
  Calendar,
  MapPin,
  Eye,
  ChevronDown,
  Loader,
  AlertCircle,
  CheckCircle2,
  Edit,
  X,
  Ban,
  Check,
  MessageSquare,
} from 'lucide-react';

export default function OfficerAssignedIssues() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Action modal states
  const [statusModal, setStatusModal] = useState({ open: false, complaint: null, newStatus: '' });
  const [noteModal, setNoteModal] = useState({ open: false, complaint: null, note: '' });
  const [rejectModal, setRejectModal] = useState({ open: false, complaint: null, reason: '' });
  const [modifyModal, setModifyModal] = useState({ open: false, complaint: null, formData: {} });

  const queryClient = useQueryClient();

  // Mutation for updating complaint status
  const updateStatusMutation = useMutation({
    mutationFn: (data) => officerAPI.updateComplaintStatus(data.complaintId, data.status),
    onSuccess: () => {
      queryClient.invalidateQueries(['officer-assigned-issues', user?.id]);
      setStatusModal({ open: false, complaint: null, newStatus: '' });
    },
  });

  // Mutation for rejecting complaint
  const rejectComplaintMutation = useMutation({
    mutationFn: (data) => officerAPI.updateComplaintStatus(data.complaintId, 'Rejected'),
    onSuccess: () => {
      queryClient.invalidateQueries(['officer-assigned-issues', user?.id]);
      setRejectModal({ open: false, complaint: null, reason: '' });
    },
  });

  // Note: Add more mutations as backend endpoints become available
  // For now, we'll use the existing updateComplaintStatus mutation

  // Fetch assigned complaints from backend
  const { data: complaintData = { complaints: [] }, isLoading, isError, error } = useQuery({
    queryKey: ['officer-assigned-issues', user?.id],
    queryFn: async () => {
      if (!user) return { complaints: [] };
      const res = await officerAPI.getAssignedComplaints();
      return res.data;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const allComplaints = complaintData?.complaints || [];

  // Extract unique categories from complaints
  const categories = useMemo(() => {
    const cats = new Set(allComplaints.map((c) => c.category).filter(Boolean));
    return Array.from(cats);
  }, [allComplaints]);

  // Apply all filters
  const filteredComplaints = useMemo(() => {
    return allComplaints.filter((complaint) => {
      // Status filter
      if (statusFilter !== 'all' && complaint.status?.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== 'all' && complaint.priority?.toLowerCase() !== priorityFilter.toLowerCase()) {
        return false;
      }

      // Category filter
      if (categoryFilter !== 'all' && complaint.category !== categoryFilter) {
        return false;
      }

      // Search term filter (search in title and description)
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        const titleMatch = complaint.title?.toLowerCase().includes(searchLower);
        const descMatch = complaint.description?.toLowerCase().includes(searchLower);
        return titleMatch || descMatch;
      }

      return true;
    });
  }, [allComplaints, statusFilter, priorityFilter, categoryFilter, searchTerm]);

  // Format date utility
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

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: allComplaints.length,
      pending: allComplaints.filter((c) => c.status?.toLowerCase() === 'pending').length,
      inProgress: allComplaints.filter((c) => c.status?.toLowerCase() === 'in progress').length,
      resolved: allComplaints.filter((c) => c.status?.toLowerCase() === 'resolved').length,
    };
  }, [allComplaints]);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6 space-y-8">
        
        {/* ========== PAGE HEADER ========== */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-slate-900">Assigned Issues</h1>
          <p className="text-slate-600 text-lg">
            View and manage complaints assigned to you
          </p>
        </div>

        {/* ========== QUICK STATS ========== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/80 backdrop-blur-lg border border-white/20 rounded-xl p-4 shadow-md hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <Briefcase className="h-8 w-8 text-blue-400 opacity-60" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg border border-white/20 rounded-xl p-4 shadow-md hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-400 opacity-60" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg border border-white/20 rounded-xl p-4 shadow-md hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <Loader className="h-8 w-8 text-blue-400 opacity-60" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg border border-white/20 rounded-xl p-4 shadow-md hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Resolved</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.resolved}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-emerald-400 opacity-60" />
            </div>
          </div>
        </div>

        {/* ========== FILTER SECTION ========== */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-lg">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-slate-700" />
              <CardTitle className="text-lg">Filters</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search Bar */}
              <div className="lg:col-span-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Priority</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white cursor-pointer"
                >
                  <option value="all">All Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset Filters Button */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setPriorityFilter('all');
                    setCategoryFilter('all');
                  }}
                  className="w-full px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold rounded-lg transition-all"
                >
                  Reset
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ========== COMPLAINTS TABLE ========== */}
        <Card className="shadow-xl border-0 overflow-hidden bg-white/80 backdrop-blur-lg">
          <CardHeader className="bg-gradient-to-r from-slate-700 via-slate-600 to-slate-800 text-white px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Briefcase className="h-6 w-6" />
                <CardTitle className="text-2xl">Assigned Complaints</CardTitle>
              </div>
              <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                {filteredComplaints.length} of {allComplaints.length}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-16">
                <Loader className="h-10 w-10 text-slate-600 animate-spin mr-4" />
                <p className="text-slate-600 font-semibold text-lg">Loading complaints...</p>
              </div>
            )}

            {/* Error State */}
            {isError && (
              <div className="flex items-start gap-4 bg-red-50 border border-red-200 rounded-lg p-8 m-6">
                <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">Error Loading Complaints</p>
                  <p className="text-sm text-red-700 mt-1">{error?.message || 'Failed to fetch assigned complaints. Please try again.'}</p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !isError && filteredComplaints.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CheckCircle2 className="h-16 w-16 text-slate-300 mb-4" />
                <p className="text-slate-600 font-semibold text-xl">No Assigned Issues</p>
                <p className="text-slate-500 text-sm mt-2">You're all caught up! No complaints match your filters.</p>
              </div>
            )}

            {/* Table */}
            {!isLoading && !isError && filteredComplaints.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-slate-200 bg-slate-50/80 backdrop-blur-sm">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Title</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Category</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Priority</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Location</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Date</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredComplaints.map((complaint) => (
                      <React.Fragment key={complaint._id}>
                        <tr
                          className="hover:bg-blue-50/50 transition-colors duration-200 cursor-pointer group"
                          onClick={() =>
                            setExpandedRow(expandedRow === complaint._id ? null : complaint._id)
                          }
                        >
                          <td className="px-6 py-4">
                            <p className="font-semibold text-slate-900 line-clamp-2 text-sm">
                              {complaint.title}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-block bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-medium">
                              {complaint.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <PriorityBadge priority={complaint.priority} />
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={complaint.status} />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-slate-600">
                              <MapPin className="h-4 w-4 text-slate-400" />
                              <span className="text-sm">{complaint.area || complaint.location || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-slate-600">
                              <Calendar className="h-4 w-4 text-slate-400" />
                              <span className="text-sm">{formatDate(complaint.createdAt)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 gap-2 inline-flex items-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/officer/issue/${complaint._id}`);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ========== UPDATE STATUS MODAL ========== */}
        {statusModal.open && statusModal.complaint && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md shadow-lg border-0 bg-white rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold">Update Status</CardTitle>
                  <button
                    onClick={() => setStatusModal({ open: false, complaint: null, newStatus: '' })}
                    className="text-white/60 hover:text-white transition"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-2">Complaint ID</p>
                  <p className="font-mono text-blue-600">{statusModal.complaint.issueId}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-2">Title</p>
                  <p className="text-slate-900">{statusModal.complaint.title}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">New Status</label>
                  <select
                    value={statusModal.newStatus}
                    onChange={(e) => setStatusModal({ ...statusModal, newStatus: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Status</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => {
                      updateStatusMutation.mutate({
                        complaintId: statusModal.complaint._id,
                        status: statusModal.newStatus,
                      });
                    }}
                    disabled={!statusModal.newStatus || updateStatusMutation.isPending}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    {updateStatusMutation.isPending ? 'Updating...' : 'Update'}
                  </Button>
                  <Button
                    onClick={() => setStatusModal({ open: false, complaint: null, newStatus: '' })}
                    className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ========== REJECT MODAL ========== */}
        {rejectModal.open && rejectModal.complaint && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md shadow-lg border-0 bg-white rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white py-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold">Reject Complaint</CardTitle>
                  <button
                    onClick={() => setRejectModal({ open: false, complaint: null, reason: '' })}
                    className="text-white/60 hover:text-white transition"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-2">Complaint ID</p>
                  <p className="font-mono text-blue-600">{rejectModal.complaint.issueId}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-2">Title</p>
                  <p className="text-slate-900">{rejectModal.complaint.title}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Reason for Rejection</label>
                  <textarea
                    value={rejectModal.reason}
                    onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                    placeholder="Enter reason for rejecting this complaint..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    rows="4"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => {
                      rejectComplaintMutation.mutate({
                        complaintId: rejectModal.complaint._id,
                      });
                    }}
                    disabled={!rejectModal.reason.trim() || rejectComplaintMutation.isPending}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    {rejectComplaintMutation.isPending ? 'Rejecting...' : 'Reject'}
                  </Button>
                  <Button
                    onClick={() => setRejectModal({ open: false, complaint: null, reason: '' })}
                    className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ========== ADD NOTE MODAL ========== */}
        {noteModal.open && noteModal.complaint && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md shadow-lg border-0 bg-white rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold">Add Note</CardTitle>
                  <button
                    onClick={() => setNoteModal({ open: false, complaint: null, note: '' })}
                    className="text-white/60 hover:text-white transition"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-2">Complaint ID</p>
                  <p className="font-mono text-blue-600">{noteModal.complaint.issueId}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Your Note</label>
                  <textarea
                    value={noteModal.note}
                    onChange={(e) => setNoteModal({ ...noteModal, note: e.target.value })}
                    placeholder="Add internal notes about this complaint..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    rows="4"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => {
                      // Note: This will be available once backend endpoint is ready
                      alert('Note saving feature will be available with backend integration');
                      setNoteModal({ open: false, complaint: null, note: '' });
                    }}
                    disabled={!noteModal.note.trim()}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    Save Note
                  </Button>
                  <Button
                    onClick={() => setNoteModal({ open: false, complaint: null, note: '' })}
                    className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ========== MODIFY COMPLAINT MODAL ========== */}
        {modifyModal.open && modifyModal.complaint && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-lg shadow-lg border-0 bg-white rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold">Modify Complaint</CardTitle>
                  <button
                    onClick={() => setModifyModal({ open: false, complaint: null, formData: {} })}
                    className="text-white/60 hover:text-white transition"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-2">Complaint ID</p>
                  <p className="font-mono text-blue-600">{modifyModal.complaint.issueId}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={modifyModal.formData.title || ''}
                    onChange={(e) => setModifyModal({
                      ...modifyModal,
                      formData: { ...modifyModal.formData, title: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Priority</label>
                  <select
                    value={modifyModal.formData.priority || ''}
                    onChange={(e) => setModifyModal({
                      ...modifyModal,
                      formData: { ...modifyModal.formData, priority: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select Priority</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                  <textarea
                    value={modifyModal.formData.description || ''}
                    onChange={(e) => setModifyModal({
                      ...modifyModal,
                      formData: { ...modifyModal.formData, description: e.target.value }
                    })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows="3"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => {
                      // Note: This will update once backend endpoint is ready
                      alert('Modify feature will be available with backend integration');
                      setModifyModal({ open: false, complaint: null, formData: {} });
                    }}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg"
                  >
                    Save Changes
                  </Button>
                  <Button
                    onClick={() => setModifyModal({ open: false, complaint: null, formData: {} })}
                    className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
