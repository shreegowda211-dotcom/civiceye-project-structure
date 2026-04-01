import React, { useMemo, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Plus } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import OfficerFilters from './components/OfficerFilters';
import OfficersTable from './components/OfficersTable';
import OfficerModal from './components/OfficerModal';

export default function AdminManageOfficers() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [area, setArea] = useState('');
  const [status, setStatus] = useState('');
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [assignModal, setAssignModal] = useState({ open: false, officer: null, complaintId: '' });
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '', area: '' });
  const [showAdd, setShowAdd] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const parseList = (payload) => {
    const root = payload?.data?.data ?? payload?.data ?? payload;
    return {
      results: Array.isArray(root?.results) ? root.results : (Array.isArray(root) ? root : []),
      total: Number(root?.total ?? (Array.isArray(root) ? root.length : 0)),
      totalPages: Number(root?.totalPages ?? 1),
      page: Number(root?.page ?? 1),
    };
  };

  const officersQuery = useQuery({
    queryKey: ['admin-officers', page, limit, debouncedSearch, department, area, status],
    queryFn: async () => {
      const res = await adminAPI.getAllOfficers({ page, limit, search: debouncedSearch, department, area, status });
      return parseList(res.data);
    },
    keepPreviousData: true,
  });

  const complaintsQuery = useQuery({
    queryKey: ['admin-unassigned-complaints'],
    queryFn: async () => {
      const res = await adminAPI.getAllComplaints({ page: 1, limit: 100, assignedOfficer: null });
      const root = res?.data?.data ?? {};
      return Array.isArray(root?.results) ? root.results : [];
    },
  });

  const officers = officersQuery.data?.results || [];
  const tableData = useMemo(() => {
    return officers.map((o) => {
      const complaints = Array.isArray(o.complaints) ? o.complaints : [];
      const assigned = typeof o.complaintsAssigned === 'number' ? o.complaintsAssigned : complaints.length;
      const active = complaints.length ? complaints.filter((c) => (c?.status || '').toLowerCase() !== 'resolved').length : assigned;
      const resolved = Math.max(0, assigned - active);
      return {
        ...o,
        isActive: typeof o.isActive === 'boolean' ? o.isActive : !o.blocked,
        complaintsAssigned: assigned,
        activeComplaintsCount: active,
        performance: typeof o.performanceScore === 'number' ? o.performanceScore : Math.min(100, 55 + (active % 45)),
        performanceStats: {
          totalAssigned: assigned,
          resolved,
          pending: active,
          avgResolutionTime: o.avgResolutionTime || 'N/A',
        },
      };
    });
  }, [officers]);

  const maxActive = useMemo(() => Math.max(1, ...tableData.map((x) => x.activeComplaintsCount || 0)), [tableData]);
  const bestOfficer = useMemo(() => {
    if (!tableData.length) return null;
    return [...tableData].sort((a, b) => (a.activeComplaintsCount - b.activeComplaintsCount))[0];
  }, [tableData]);

  const addMutation = useMutation({
    mutationFn: (payload) => adminAPI.createOfficer(payload),
    onSuccess: () => {
      setShowAdd(false);
      setForm({ name: '', email: '', password: '', department: '', area: '' });
      queryClient.invalidateQueries({ queryKey: ['admin-officers'] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: (officer) => adminAPI.updateOfficerStatus(officer._id, !officer.isActive),
    onMutate: async (officer) => {
      queryClient.setQueryData(['admin-officers', page, limit, debouncedSearch, department, area, status], (old) =>
        old ? { ...old, results: (old.results || []).map((r) => (r._id === officer._id ? { ...r, isActive: !r.isActive, blocked: r.isActive } : r)) } : old
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['admin-officers'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminAPI.deleteOfficer(id),
    onMutate: async (id) => {
      queryClient.setQueryData(['admin-officers', page, limit, debouncedSearch, department, area, status], (old) =>
        old ? { ...old, results: (old.results || []).filter((r) => r._id !== id) } : old
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['admin-officers'] }),
  });

  const assignMutation = useMutation({
    mutationFn: ({ complaintId, officerId }) => adminAPI.assignOfficer(complaintId, officerId),
    onSuccess: () => {
      setAssignModal({ open: false, officer: null, complaintId: '' });
      queryClient.invalidateQueries({ queryKey: ['admin-officers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-unassigned-complaints'] });
    },
  });

  const totalPages = Math.max(1, officersQuery.data?.totalPages || 1);

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manage Officers</h1>
            <p className="text-sm text-slate-600">Best officer based on workload: <span className="font-semibold">{bestOfficer?.name || 'N/A'}</span></p>
          </div>
          <Button onClick={() => setShowAdd(true)} className="gap-2"><Plus className="h-4 w-4" /> Add Officer</Button>
        </div>

        <Card>
          <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
          <CardContent>
            <OfficerFilters
              search={search}
              onSearchChange={(v) => { setSearch(v); setPage(1); }}
              department={department}
              onDepartmentChange={(v) => { setDepartment(v); setPage(1); }}
              area={area}
              onAreaChange={(v) => { setArea(v); setPage(1); }}
              status={status}
              onStatusChange={(v) => { setStatus(v); setPage(1); }}
              departments={['Road Damage', 'Garbage', 'Streetlight', 'Water Leakage', 'Other']}
            />
          </CardContent>
        </Card>

        {officersQuery.isError && (
          <Card className="border-rose-200 bg-rose-50/80">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2 text-rose-700"><AlertTriangle className="h-4 w-4" /> Failed to load officers.</div>
              <Button size="sm" onClick={() => officersQuery.refetch()}>Retry</Button>
            </CardContent>
          </Card>
        )}

        <Card className="overflow-hidden">
          <CardHeader className="border-b"><CardTitle>Officer List ({officersQuery.data?.total || tableData.length})</CardTitle></CardHeader>
          <CardContent className="p-0">
            <OfficersTable
              officers={tableData}
              isLoading={officersQuery.isLoading}
              maxActiveComplaintsCount={maxActive}
              onView={(o) => { setSelectedOfficer(o); setModalOpen(true); }}
              onToggleStatus={(o) => {
                if (!window.confirm(`Are you sure you want to ${o.isActive ? 'block' : 'unblock'} ${o.name}?`)) return;
                statusMutation.mutate(o);
              }}
              onDelete={(o) => {
                if (!window.confirm(`Delete officer ${o.name}?`)) return;
                deleteMutation.mutate(o._id);
              }}
              onAssignComplaint={(o) => setAssignModal({ open: true, officer: o, complaintId: '' })}
              processingId={statusMutation.variables?._id}
            />
          </CardContent>
        </Card>

        <div className="flex items-center justify-between rounded-xl border bg-white px-4 py-3">
          <div className="text-sm text-slate-600">Page <span className="font-semibold text-slate-900">{page}</span> of <span className="font-semibold text-slate-900">{totalPages}</span></div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
          </div>
        </div>
      </div>

      <OfficerModal officer={selectedOfficer} open={modalOpen} onClose={() => { setModalOpen(false); setSelectedOfficer(null); }} />

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5">
            <h3 className="mb-3 text-lg font-semibold">Add Officer</h3>
            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); addMutation.mutate(form); }}>
              <input className="w-full rounded border px-3 py-2" placeholder="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
              <input className="w-full rounded border px-3 py-2" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
              <input className="w-full rounded border px-3 py-2" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required />
              <input className="w-full rounded border px-3 py-2" placeholder="Department" value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} required />
              <input className="w-full rounded border px-3 py-2" placeholder="Area" value={form.area} onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))} />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
                <Button type="submit" disabled={addMutation.isPending}>Save</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {assignModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-5">
            <h3 className="text-lg font-semibold">Assign Complaint</h3>
            <p className="mt-1 text-sm text-slate-600">Officer: {assignModal.officer?.name} ({assignModal.officer?.officerId})</p>
            <div className="mt-3 space-y-3">
              <select value={assignModal.complaintId} onChange={(e) => setAssignModal((s) => ({ ...s, complaintId: e.target.value }))} className="w-full rounded border px-3 py-2">
                <option value="">Select complaint</option>
                {complaintsQuery.data?.map((c) => (
                  <option key={c._id} value={c.issueId || c._id}>{c.title || c.issueId || c._id}</option>
                ))}
              </select>
              <div className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-700">
                Smart assignment indicator: this officer currently has {assignModal.officer?.activeComplaintsCount || 0} active complaints.
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setAssignModal({ open: false, officer: null, complaintId: '' })}>Cancel</Button>
                <Button
                  onClick={() =>
                    assignMutation.mutate({
                      complaintId: assignModal.complaintId,
                      officerId: assignModal.officer?.officerId || assignModal.officer?._id,
                    })
                  }
                  disabled={!assignModal.complaintId || assignMutation.isPending}
                >
                  Assign Complaint
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
