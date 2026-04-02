import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/services/api';
import { Card, CardHeader, CardContent, CardTitle, GradientCard } from '@/components/ui/card';
import Table from '@/components/table';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Filter, UserPlus, RefreshCw, AlertTriangle, ArrowUpRight, Loader2, X } from 'lucide-react';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import * as Dialog from "@radix-ui/react-dialog";

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

  // Assign officer modal (UI only)
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignMode, setAssignMode] = useState('assign'); // 'assign' | 'reassign'
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [officerIdInput, setOfficerIdInput] = useState('');
  const [officerIdError, setOfficerIdError] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Fetch all complaints (with backend filters)
  const { data: complaintsRaw, isLoading, refetch } = useQuery({
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
      console.log('Fetched complaints:', res.data);
      return res.data?.data || [];
    },
    staleTime: 60 * 1000,
  });
  // Use paginated results from backend
  const complaints = Array.isArray(complaintsRaw?.data?.results) ? complaintsRaw.data.results : [];

  // Table columns
  const columns = [
    { key: 'issueId', label: 'Issue ID' },
    { key: 'title', label: 'Title' },
    { key: 'area', label: 'Area' },
    { key: 'category', label: 'Category' },
    { key: 'priority', label: 'Priority' },
    { key: 'status', label: 'Status' },
    { key: 'assignedOfficer', label: 'Assigned Officer' },
    { key: 'officerId', label: 'Officer ID' },
    { key: 'createdAt', label: 'Reported' },
    { key: 'actions', label: 'Actions' },
  ];

  // Filtering logic (area and date are now backend, but fallback to client-side for partial matches)
  const filteredComplaints = useMemo(() => {
    return (Array.isArray(complaints) ? complaints : []).filter(c => {
      if (filters.area && !(c.location || '').toLowerCase().includes(filters.area.toLowerCase())) return false;
      if (filters.dateFrom && new Date(c.createdAt) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && new Date(c.createdAt) > new Date(filters.dateTo)) return false;
      return true;
    });
  }, [complaints, filters]);

  // Smart auto-assign UI (UI only, no API integration yet)
  const [smartAutoAssigning, setSmartAutoAssigning] = useState(false);
  const [smartAutoAssignPreview, setSmartAutoAssignPreview] = useState(null);

  // Actions (integrate with backend)
  const urgentMutation = useMutation({
    mutationFn: (complaintId) => adminAPI.markUrgent(complaintId),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-complaints']);
      queryClient.invalidateQueries(['admin-escalated-complaints']);
      refetch();
    },
  });

  const escalateMutation = useMutation({
    mutationFn: (complaintId) => adminAPI.escalate(complaintId),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-complaints']);
      queryClient.invalidateQueries(['admin-escalated-complaints']);
      refetch();
    },
  });

  // Add officer assignment mutation
  const assignOfficerMutation = useMutation({
    mutationFn: ({ complaintId, officerId }) => 
      adminAPI.assignOfficer(complaintId, officerId),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-complaints']);
      refetch();
      closeAssignModal();
    },
    onError: (error) => {
      console.error('Assignment failed:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to assign officer';
      setOfficerIdError(errorMsg);
    },
  });

  const normalizeOfficerId = (v) => (typeof v === 'string' ? v.trim().toUpperCase() : '');
  const validateOfficerId = (v) => {
    const val = normalizeOfficerId(v);
    if (!val) return 'Enter Officer ID';
    if (!val.startsWith('OFF-')) return 'Officer ID must start with OFF-';
    if (!/^OFF-\d+$/.test(val)) return 'Officer ID must be in the form OFF-XXXX';
    return '';
  };

  const openAssignModal = (complaint, mode) => {
    setSelectedComplaint(complaint);
    setAssignMode(mode);
    setOfficerIdInput('');
    setOfficerIdError('');
    setAssigning(false);
    setAssignModalOpen(true);
  };

  const closeAssignModal = () => {
    setAssignModalOpen(false);
    setSelectedComplaint(null);
    setOfficerIdInput('');
    setOfficerIdError('');
    setAssigning(false);
  };

  // UI only: simulate assignment loading and do NOT call API yet.
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    const err = validateOfficerId(officerIdInput);
    setOfficerIdError(err);
    if (err) return;

    setAssigning(true);
    // Call actual API to assign officer
    assignOfficerMutation.mutate(
      { complaintId: selectedComplaint._id, officerId: normalizeOfficerId(officerIdInput) },
      {
        onSettled: () => {
          setAssigning(false);
        },
      }
    );
  };

  const handleMarkUrgent = (complaint) => {
    if (complaint.urgent) {
      alert('Complaint is already marked as urgent.');
      return;
    }
    if (window.confirm('Mark this complaint as urgent?')) {
      urgentMutation.mutate(complaint._id);
    }
  };
  const handleEscalate = (complaint) => {
    if (complaint.escalated) {
      alert('Complaint is already escalated.');
      return;
    }
    if (window.confirm('Escalate this complaint?')) {
      escalateMutation.mutate(complaint._id);
    }
  };

  const handleSmartAutoAssignOfficer = () => {
    if (smartAutoAssigning) return;
    setSmartAutoAssigning(true);
    setSmartAutoAssignPreview(null);

    // UI-only: simulate loading and show current assigned officer info as preview.
    window.setTimeout(() => {
      const sample =
        filteredComplaints.find((c) => c.assignedOfficer) || filteredComplaints[0] || null;

      setSmartAutoAssignPreview(
        sample
          ? {
              issueId: sample.issueId,
              assignedOfficerName: sample.assignedOfficer?.name || 'Unassigned',
              officerId:
                sample.assignedOfficer?.officerId ||
                sample.assignedOfficer?._id ||
                '—',
            }
          : null
      );
      setSmartAutoAssigning(false);
    }, 1400);
  };

  return (
    <DashboardLayout>
      {/* DEBUG: Show raw complaints data for troubleshooting */}
      <div style={{background: '#fffbe6', color: '#b36b00', padding: '8px', margin: '8px 0', fontSize: '12px', border: '1px solid #ffe58f', borderRadius: '4px'}}>
        <strong>Debug: complaints data</strong>
        <pre style={{whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0}}>{JSON.stringify(complaints, null, 2)}</pre>
      </div>
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-extrabold text-blue-900 tracking-widest uppercase">All Issues</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setFilters({ area: '', category: '', status: '', dateFrom: '', dateTo: '' })}><Filter className="h-4 w-4 mr-1" /> Reset Filters</Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSmartAutoAssignOfficer}
              disabled={smartAutoAssigning}
              className="bg-emerald-600 hover:bg-emerald-700 text-black border border-emerald-300"
              title="Smart auto-assign (UI preview only)"
            >
              {smartAutoAssigning ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Auto Assigning...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-200 font-bold">✨</span>
                  Auto Assign Officer
                </span>
              )}
            </Button>
          </div>
        </div>

        {smartAutoAssignPreview ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-900">Smart Auto Assign Preview</p>
              <p className="mt-1 text-sm text-emerald-950 font-semibold">
                Complaint: {smartAutoAssignPreview.issueId}
              </p>
              <p className="text-sm text-emerald-900">
                Assigned Officer: {smartAutoAssignPreview.assignedOfficerName}
              </p>
              <p className="text-xs font-semibold text-emerald-900">
                Officer ID: {smartAutoAssignPreview.officerId}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-800">UI only</p>
            </div>
          </div>
        ) : null}

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
                    <td className="px-4 py-3 text-slate-700 font-semibold">{complaint.assignedOfficer?.officerId || '-'}</td>
                    <td className="px-4 py-3 text-slate-500 font-semibold tracking-wide">{new Date(complaint.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 flex gap-2">
                      <Button size="sm" variant="ghost" className="border border-blue-200 hover:bg-blue-100" onClick={() => openAssignModal(complaint, 'assign')} title="Assign Officer" disabled={assigning}><UserPlus className="h-4 w-4 text-blue-700" /></Button>
                      <Button size="sm" variant="ghost" className="border border-blue-200 hover:bg-blue-100" onClick={() => openAssignModal(complaint, 'reassign')} title="Reassign" disabled={assigning}><RefreshCw className="h-4 w-4 text-blue-700" /></Button>
                      <Button size="sm" variant="ghost" className="border border-amber-200 hover:bg-amber-50" onClick={() => handleMarkUrgent(complaint)} title="Mark Urgent" disabled={urgentMutation.isLoading || complaint.urgent}><AlertTriangle className="h-4 w-4 text-amber-500" /></Button>
                      <Button size="sm" variant="ghost" className="border border-rose-200 hover:bg-rose-50" onClick={() => handleEscalate(complaint)} title="Escalate" disabled={escalateMutation.isLoading || complaint.escalated}><ArrowUpRight className="h-4 w-4 text-rose-500" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => setExpandedRow(expandedRow === complaint._id ? null : complaint._id)}>{expandedRow === complaint._id ? <ChevronUp /> : <ChevronDown />}</Button>
                    </td>
                  </tr>
                  {expandedRow === complaint._id && (
                    <tr className="bg-blue-50/60">
                      <td colSpan={10} className="p-4 text-sm text-blue-900">
                        <div className="mb-2"><span className="font-bold uppercase tracking-widest">Description:</span> {complaint.description}</div>
                        <div className="mb-2"><span className="font-bold uppercase tracking-widest">Reported by:</span> {complaint.citizen?.name || complaint.citizen}</div>
                        <div className="mb-2"><span className="font-bold uppercase tracking-widest">Assigned Officer:</span> {complaint.assignedOfficer?.name || 'Unassigned'} ({complaint.assignedOfficer?.officerId || '-'})</div>
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

      {/* Assign/Reassign Officer Modal (UI only) */}
      <Dialog.Root open={assignModalOpen} onOpenChange={(open) => { if (!open) closeAssignModal(); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <Dialog.Title className="text-lg font-bold text-blue-900 uppercase tracking-widest">
                {assignMode === 'assign' ? 'Assign Officer' : 'Reassign Officer'}
              </Dialog.Title>
              <button type="button" onClick={closeAssignModal} className="p-1 rounded hover:bg-slate-100" aria-label="Close">
                <X className="h-4 w-4 text-slate-700" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit}>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-blue-900 tracking-widest uppercase">
                  Enter Officer ID
                </label>
                <input
                  value={officerIdInput}
                  onChange={(e) => {
                    setOfficerIdInput(e.target.value);
                    if (officerIdError) setOfficerIdError('');
                  }}
                  placeholder="OFF-1001"
                  className="border border-blue-200 rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 font-semibold text-blue-900 bg-white placeholder:text-blue-300"
                  autoFocus
                />
                {officerIdError ? (
                  <p className="text-sm text-red-600 font-semibold">{officerIdError}</p>
                ) : null}
              </div>

              <div className="flex gap-2 mt-5">
                <Button type="button" variant="ghost" onClick={closeAssignModal} disabled={assigning} className="w-full">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={assigning}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-black disabled:opacity-60"
                >
                  {assigning ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Assigning...
                    </span>
                  ) : (
                    'Assign'
                  )}
                </Button>
              </div>

              {selectedComplaint ? (
                <p className="mt-3 text-xs text-slate-600">
                  Complaint: {selectedComplaint.issueId}
                </p>
              ) : null}
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </DashboardLayout>
  );
}
