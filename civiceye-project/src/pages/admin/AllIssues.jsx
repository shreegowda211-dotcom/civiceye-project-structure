import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/services/api';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import Table from '@/components/table';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Filter, UserPlus, RefreshCw, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';

// TODO: Import/implement OfficerAssignModal, EscalateModal, etc.

export default function AdminAllIssues() {
  const queryClient = useQueryClient();
  // Filters
  const [filters, setFilters] = useState({
    area: '',
    category: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  });
  const [expandedRow, setExpandedRow] = useState(null);

  // Fetch all complaints (with backend filters)
  const { data: complaints = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-complaints', filters],
    queryFn: async () => {
      // Pass all filters to backend API
      const backendFilters = {};
      if (filters.category) backendFilters.category = filters.category;
      if (filters.status) backendFilters.status = filters.status;
      if (filters.area) backendFilters.location = filters.area;
      if (filters.dateFrom) backendFilters.dateFrom = filters.dateFrom;
      if (filters.dateTo) backendFilters.dateTo = filters.dateTo;
      const res = await adminAPI.getAllComplaints(backendFilters);
      return res.data.complaints || [];
    },
    staleTime: 60 * 1000,
  });

  // Table columns
  const columns = [
    { key: 'issueId', label: 'Issue ID' },
    { key: 'title', label: 'Title' },
    { key: 'area', label: 'Area' },
    { key: 'category', label: 'Category' },
    { key: 'priority', label: 'Priority' },
    { key: 'status', label: 'Status' },
    { key: 'assignedOfficer', label: 'Assigned Officer' },
    { key: 'createdAt', label: 'Reported' },
    { key: 'actions', label: 'Actions' },
  ];

  // Filtering logic (area and date are now backend, but fallback to client-side for partial matches)
  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      if (filters.area && !(c.location || '').toLowerCase().includes(filters.area.toLowerCase())) return false;
      if (filters.dateFrom && new Date(c.createdAt) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && new Date(c.createdAt) > new Date(filters.dateTo)) return false;
      return true;
    });
  }, [complaints, filters]);

  // Actions (integrate with backend)
  const assignMutation = useMutation({
    mutationFn: ({ complaintId, officerId }) => adminAPI.assignOfficer(complaintId, officerId),
    onSuccess: () => refetch(),
  });
  const urgentMutation = useMutation({
    mutationFn: (complaintId) => adminAPI.markUrgent(complaintId),
    onSuccess: () => refetch(),
  });
  const autoAssignMutation = useMutation({
    mutationFn: () => adminAPI.autoAssignByCategory(),
    onSuccess: (data) => {
      refetch();
      if (data?.data?.success) {
        const assignedCount = data.data.assignedCount ?? 0;
        const totalChecked = data.data.totalChecked ?? 0;
        alert(`Auto-assign completed. Assigned: ${assignedCount}, checked: ${totalChecked}.`);
      } else {
        alert(data?.data?.message || 'Auto-assign completed with no assignments.');
      }
    },
    onError: (error) => {
      console.error(error);
      const errorMsg = error?.response?.data?.message || 'Auto-assign failed. Check console for details.';
      alert(errorMsg);
    },
  });

  const escalateMutation = useMutation({
    mutationFn: (complaintId) => adminAPI.escalate(complaintId),
    onSuccess: () => refetch(),
  });

  // Example: open assign modal, then call assignMutation.mutate({ complaintId, officerId })
  const handleAssign = (complaint) => {
    const chosenOfficer = window.prompt('Enter officer ID to assign (MongoDB _id):');
    if (!chosenOfficer) return;
    assignMutation.mutate({ complaintId: complaint._id, officerId: chosenOfficer });
  };
  const handleReassign = (complaint) => {
    const chosenOfficer = window.prompt('Enter officer ID to reassign:', complaint.assignedOfficer?._id || '');
    if (!chosenOfficer) return;
    assignMutation.mutate({ complaintId: complaint._id, officerId: chosenOfficer });
  };
  const handleMarkUrgent = (complaint) => {
    if (window.confirm('Mark this complaint as urgent?')) {
      urgentMutation.mutate(complaint._id);
    }
  };
  const handleEscalate = (complaint) => {
    if (window.confirm('Escalate this complaint?')) {
      escalateMutation.mutate(complaint._id);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-extrabold text-blue-900 tracking-widest uppercase">All Issues</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setFilters({ area: '', category: '', status: '', dateFrom: '', dateTo: '' })}><Filter className="h-4 w-4 mr-1" /> Reset Filters</Button>
            <Button variant="default" size="sm" onClick={() => autoAssignMutation.mutate()}>Auto-assign Unassigned</Button>
          </div>
        </div>
        {/* Filters UI */}
        <Card className="mb-4 border-blue-100 bg-blue-50/50">
          <CardContent className="flex flex-wrap gap-4 p-4 items-end">
            <div className="flex flex-col">
              <label className="text-xs font-bold text-blue-900 tracking-widest uppercase mb-1">Area</label>
              <input className="border border-blue-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 font-semibold text-blue-900 bg-white placeholder:text-blue-300" placeholder="Enter Area" value={filters.area} onChange={e => setFilters(f => ({ ...f, area: e.target.value }))} />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-bold text-blue-900 tracking-widest uppercase mb-1">Category</label>
              <select className="border border-blue-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 font-semibold text-blue-900 bg-white" value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
                <option value="">All Categories</option>
                <option value="Road Damage">Road Damage</option>
                <option value="Garbage">Garbage</option>
                <option value="Streetlight">Streetlight</option>
                <option value="Water Leakage">Water Leakage</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-bold text-blue-900 tracking-widest uppercase mb-1">Status</label>
              <select className="border border-blue-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 font-semibold text-blue-900 bg-white" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-bold text-blue-900 tracking-widest uppercase mb-1">From</label>
              <input className="border border-blue-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 font-semibold text-blue-900 bg-white" type="date" value={filters.dateFrom} onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))} />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-bold text-blue-900 tracking-widest uppercase mb-1">To</label>
              <input className="border border-blue-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 font-semibold text-blue-900 bg-white" type="date" value={filters.dateTo} onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))} />
            </div>
          </CardContent>
        </Card>
        {/* Table */}
        <Card className="overflow-x-auto border-blue-100">
          <CardHeader className="bg-blue-50 border-blue-100">
            <CardTitle className="text-blue-900 font-extrabold tracking-widest uppercase">Complaints List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table
              columns={columns}
              data={filteredComplaints}
              isLoading={isLoading}
              emptyMessage="No complaints found"
              renderRow={complaint => (
                <React.Fragment key={complaint._id}>
                  <tr className="border-b border-blue-100 hover:bg-blue-50/70 transition group">
                    <td className="px-4 py-3 font-mono text-blue-800 group-hover:underline tracking-widest text-xs font-bold uppercase">{complaint.issueId}</td>
                    <td className="px-4 py-3 text-slate-900 font-bold uppercase tracking-wide">{complaint.title}</td>
                    <td className="px-4 py-3 text-slate-700 font-semibold uppercase tracking-wide">{complaint.location}</td>
                    <td className="px-4 py-3 text-slate-700 font-semibold uppercase tracking-wide">{complaint.category}</td>
                    <td className="px-4 py-3"><PriorityBadge priority={(complaint.priority || '').toLowerCase()} /></td>
                    <td className="px-4 py-3"><StatusBadge status={(complaint.status || '').toLowerCase()} /></td>
                    <td className="px-4 py-3 text-slate-700 font-semibold">{complaint.assignedOfficer?.name || 'Unassigned'}</td>
                    <td className="px-4 py-3 text-slate-500 font-semibold tracking-wide">{new Date(complaint.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 flex gap-2">
                      <Button size="sm" variant="ghost" className="border border-blue-200 hover:bg-blue-100" onClick={() => handleAssign(complaint)} title="Assign Officer"><UserPlus className="h-4 w-4 text-blue-700" /></Button>
                      <Button size="sm" variant="ghost" className="border border-blue-200 hover:bg-blue-100" onClick={() => handleReassign(complaint)} title="Reassign"><RefreshCw className="h-4 w-4 text-blue-700" /></Button>
                      <Button size="sm" variant="ghost" className="border border-amber-200 hover:bg-amber-50" onClick={() => handleMarkUrgent(complaint)} title="Mark Urgent"><AlertTriangle className="h-4 w-4 text-amber-500" /></Button>
                      <Button size="sm" variant="ghost" className="border border-rose-200 hover:bg-rose-50" onClick={() => handleEscalate(complaint)} title="Escalate"><ArrowUpRight className="h-4 w-4 text-rose-500" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => setExpandedRow(expandedRow === complaint._id ? null : complaint._id)}>{expandedRow === complaint._id ? <ChevronUp /> : <ChevronDown />}</Button>
                    </td>
                  </tr>
                  {expandedRow === complaint._id && (
                    <tr className="bg-blue-50/60">
                      <td colSpan={8} className="p-4 text-sm text-blue-900">
                        <div className="mb-2"><span className="font-bold uppercase tracking-widest">Description:</span> {complaint.description}</div>
                        <div className="mb-2"><span className="font-bold uppercase tracking-widest">Reported by:</span> {complaint.citizen?.name || complaint.citizen}</div>
                        <div className="mb-2"><span className="font-bold uppercase tracking-widest">Assigned Officer:</span> {complaint.assignedOfficer?.name || 'Unassigned'}</div>
                        {complaint.urgent && <div className="inline-block px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-extrabold tracking-widest mr-2">URGENT</div>}
                        {complaint.escalated && <div className="inline-block px-2 py-1 bg-rose-100 text-rose-700 rounded text-xs font-extrabold tracking-widest">ESCALATED</div>}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
