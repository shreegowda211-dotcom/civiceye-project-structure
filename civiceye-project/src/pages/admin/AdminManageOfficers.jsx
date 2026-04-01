import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/services/api';
import { Card, CardHeader, CardContent, CardTitle, GradientCard } from '@/components/ui/card';
import Table from '@/components/table';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, BarChart2, Plus } from 'lucide-react';

function OfficerPerformanceBar({ score }) {
  // score: 0-100
  return (
    <div className="w-full bg-slate-200 rounded-full h-3">
      <div
        className="h-3 rounded-full bg-emerald-500 transition-all"
        style={{ width: `${score || 0}%` }}
      />
    </div>
  );
}

function WorkloadIndicator({ count, maxCount }) {
  const activeCount = typeof count === 'number' ? count : 0;
  const max = Math.max(1, typeof maxCount === 'number' ? maxCount : 1);

  // Thresholds (UI): low -> green, medium -> yellow, high -> red
  const level = activeCount <= 2 ? 'low' : activeCount <= 5 ? 'medium' : 'high';

  const badgeClasses =
    level === 'low'
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
      : level === 'medium'
        ? 'bg-amber-100 text-amber-800 border-amber-200'
        : 'bg-rose-100 text-rose-800 border-rose-200';

  const barClasses =
    level === 'low'
      ? 'bg-emerald-500'
      : level === 'medium'
        ? 'bg-amber-500'
        : 'bg-rose-500';

  const textClasses =
    level === 'low'
      ? 'text-emerald-700'
      : level === 'medium'
        ? 'text-amber-700'
        : 'text-rose-700';

  const pct = Math.min(100, Math.round((activeCount / max) * 100));

  return (
    <div className="flex items-center gap-3">
      <div className={`inline-flex items-center px-2 py-1 rounded border text-xs font-bold ${badgeClasses}`}>
        {level === 'low' ? 'Low' : level === 'medium' ? 'Medium' : 'High'}
      </div>
      <div className="flex-1">
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div className={`h-2 rounded-full ${barClasses}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
      <span className={`text-sm font-semibold ${textClasses}`}>{activeCount}</span>
    </div>
  );
}

export default function AdminManageOfficers() {
  const queryClient = useQueryClient();
  const { data: officers = [], isLoading } = useQuery({
    queryKey: ['admin-officers'],
    queryFn: async () => {
      try {
        const res = await adminAPI.getAllOfficers();
        return res.data.data || [];
      } catch (err) {
        console.warn('adminAPI.getAllOfficers failed', err?.message || err);
        return [];
      }
    },
    staleTime: 60 * 1000,
  });

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editOfficer, setEditOfficer] = useState(null);

  // Add Officer form state
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    area: '',
    complaintsAssigned: 0,
  });
  const [addFormError, setAddFormError] = useState('');
  const [addFormSuccess, setAddFormSuccess] = useState('');
  // Edit Officer form state
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    department: '',
    area: '',
    complaintsAssigned: 0,
  });
  const [editFormError, setEditFormError] = useState('');
  const [editFormSuccess, setEditFormSuccess] = useState('');

  // Placeholder for add, edit, delete, view performance
  const addOfficerMutation = useMutation({
    mutationFn: (data) => adminAPI.createOfficer(data),
    onSuccess: () => {
      setAddFormSuccess('Officer added successfully!');
      setAddFormError('');
      setAddForm({ name: '', email: '', password: '', department: '', area: '' });
      queryClient.invalidateQueries(['admin-officers']);
      setTimeout(() => {
        setShowAddModal(false);
        setAddFormSuccess('');
      }, 1200);
    },
    onError: (err) => {
      setAddFormError(err?.response?.data?.message || 'Failed to add officer.');
      setAddFormSuccess('');
    },
  });
  const editOfficerMutation = useMutation({
    mutationFn: ({ id, data }) => adminAPI.updateOfficer(id, data),
    onSuccess: () => {
      setEditFormSuccess('Officer updated successfully!');
      setEditFormError('');
      setEditOfficer(null);
      setEditForm({ name: '', email: '', department: '', area: '' });
      queryClient.invalidateQueries(['admin-officers']);
      setTimeout(() => {
        setShowEditModal(false);
        setEditFormSuccess('');
      }, 1200);
    },
    onError: (err) => {
      setEditFormError(err?.response?.data?.message || 'Failed to update officer.');
      setEditFormSuccess('');
    },
  });
  const deleteOfficerMutation = useMutation({
    mutationFn: (id) => adminAPI.deleteOfficer(id),
    onSuccess: () => queryClient.invalidateQueries(['admin-officers']),
  });

  // Table columns
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'department', label: 'Department' },
    { key: 'area', label: 'Assigned Area' },
    { key: 'complaintsAssigned', label: 'Complaints Assigned' },
    { key: 'activeComplaints', label: 'Active Complaints Count' },
    { key: 'performance', label: 'Performance' },
    { key: 'actions', label: 'Actions' },
  ];

  // Normalize officer data
  const tableData = useMemo(() => {
    return officers.map((o) => {
      const complaintsList = Array.isArray(o.complaints) ? o.complaints : [];
      const complaintsAssignedCount =
        typeof o.complaintsAssigned === 'number' ? o.complaintsAssigned : complaintsList.length;

      const activeFromList = complaintsList.filter((c) => {
        const status = (c?.status || '').toString().toLowerCase();
        return status !== 'resolved';
      }).length;

      // UI-only: if API returns a complaints list with statuses, use it; otherwise use complaintsAssigned as a fallback.
      const activeComplaintsCount = complaintsList.length ? activeFromList : complaintsAssignedCount;

      return {
        ...o,
        area: o.area || '-',
        complaintsAssigned: complaintsAssignedCount,
        activeComplaintsCount,
        // Deterministic placeholder: avoids Math.random() during render.
        performance:
          typeof o.performanceScore === 'number'
            ? o.performanceScore
            : Math.min(100, 55 + (activeComplaintsCount % 45)),
      };
    });
  }, [officers]);

  const maxActiveComplaintsCount = useMemo(() => {
    return Math.max(
      1,
      ...tableData.map((t) => (typeof t.activeComplaintsCount === 'number' ? t.activeComplaintsCount : 0))
    );
  }, [tableData]);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-900">Manage Officers</h1>
          <Button onClick={() => setShowAddModal(true)} className="gap-2">
            <Plus className="h-5 w-5" /> Add Officer
          </Button>
        </div>
        {/* Card + Table Hybrid */}
        <Card className="overflow-x-auto">
          <CardHeader>
            <CardTitle>Officer List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table
              columns={columns}
              data={tableData}
              isLoading={isLoading}
              emptyMessage="No officers found"
              renderRow={officer => (
                <tr key={officer._id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-medium text-slate-900">{officer.name}</td>
                  <td className="px-4 py-3 text-slate-700">{officer.department}</td>
                  <td className="px-4 py-3 text-slate-600">{officer.area || '-'}</td>
                  <td className="px-4 py-3 text-center">{officer.complaintsAssigned}</td>
                  <td className="px-4 py-3 min-w-[240px]">
                    <WorkloadIndicator
                      count={officer.activeComplaintsCount}
                      maxCount={maxActiveComplaintsCount}
                    />
                  </td>
                  <td className="px-4 py-3 min-w-[120px]">
                    <OfficerPerformanceBar score={officer.performance} />
                    <span className="text-xs text-slate-500 ml-2 align-middle">{officer.performance}%</span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Edit Officer"
                      onClick={() => {
                        setEditOfficer(officer);
                        setEditForm({
                          name: officer.name,
                          email: officer.email,
                          department: officer.department,
                          area: officer.area || '',
                        });
                        setShowEditModal(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Delete Officer"
                      onClick={() => deleteOfficerMutation.mutate(officer._id)}
                      disabled={deleteOfficerMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-rose-500" />
                    </Button>
                    <Button variant="ghost" size="sm" title="View Performance"><BarChart2 className="h-4 w-4 text-emerald-500" /></Button>
                  </td>
                </tr>
              )}
            />
          </CardContent>
        </Card>
        {/* Add Officer Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Add New Officer</h2>
              {addFormSuccess && <div className="mb-2 text-green-600 text-sm">{addFormSuccess}</div>}
              {addFormError && <div className="mb-2 text-rose-600 text-sm font-semibold">{addFormError}</div>}
              <form
                onSubmit={e => {
                  e.preventDefault();
                  // Basic frontend validation
                  if (!addForm.name || !addForm.email || !addForm.password || !addForm.department || !addForm.area) {
                    setAddFormError('All fields including area are required.');
                    setAddFormSuccess('');
                    return;
                  }
                  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addForm.email)) {
                    setAddFormError('Invalid email address.');
                    setAddFormSuccess('');
                    return;
                  }
                  if (addForm.password.length < 8) {
                    setAddFormError('Password must be at least 8 characters.');
                    setAddFormSuccess('');
                    return;
                  }
                  setAddFormError('');
                  addOfficerMutation.mutate(addForm);
                }}
                className="space-y-4"
              >
                <input
                  className="w-full border rounded px-3 py-2"
                  placeholder="Name"
                  required
                  value={addForm.name}
                  onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                />
                <input
                  className="w-full border rounded px-3 py-2"
                  placeholder="Email"
                  type="email"
                  required
                  value={addForm.email}
                  onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))}
                />
                <input
                  className="w-full border rounded px-3 py-2"
                  placeholder="Password"
                  type="password"
                  required
                  value={addForm.password}
                  onChange={e => setAddForm(f => ({ ...f, password: e.target.value }))}
                />
                <input
                  className="w-full border rounded px-3 py-2"
                  placeholder="Department"
                  required
                  value={addForm.department}
                  onChange={e => setAddForm(f => ({ ...f, department: e.target.value }))}
                />
                <input
                  className="w-full border rounded px-3 py-2"
                  placeholder="Assigned Area"
                  value={addForm.area}
                  onChange={e => setAddForm(f => ({ ...f, area: e.target.value }))}
                />
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
                  <Button type="submit" disabled={addOfficerMutation.isPending}>Add Officer</Button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Edit Officer Modal */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Edit Officer</h2>
              {editFormError && <div className="mb-2 text-red-600 text-sm">{editFormError}</div>}
              {editFormSuccess && <div className="mb-2 text-green-600 text-sm">{editFormSuccess}</div>}
              <form
                onSubmit={e => {
                  e.preventDefault();
                  // Basic frontend validation
                  if (!editForm.name || !editForm.email || !editForm.department || !editForm.area) {
                    setEditFormError('All fields including area are required.');
                    setEditFormSuccess('');
                    return;
                  }
                                  <input
                                    className="w-full border rounded px-3 py-2"
                                    placeholder="Complaints Assigned"
                                    type="number"
                                    min={0}
                                    value={editForm.complaintsAssigned}
                                    onChange={e => setEditForm(f => ({ ...f, complaintsAssigned: Number(e.target.value) }))}
                                  />
                  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
                    setEditFormError('Invalid email address.');
                    setEditFormSuccess('');
                    return;
                  }
                  setEditFormError('');
                  if (editOfficer) {
                    editOfficerMutation.mutate({ id: editOfficer._id, data: editForm });
                  }
                }}
                className="space-y-4"
              >
                <input
                  className="w-full border rounded px-3 py-2"
                  placeholder="Name"
                  required
                  value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                />
                <input
                  className="w-full border rounded px-3 py-2"
                  placeholder="Email"
                  type="email"
                  required
                  value={editForm.email}
                  onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                />
                <input
                  className="w-full border rounded px-3 py-2"
                  placeholder="Department"
                  required
                  value={editForm.department}
                  onChange={e => setEditForm(f => ({ ...f, department: e.target.value }))}
                />
                <input
                  className="w-full border rounded px-3 py-2"
                  placeholder="Assigned Area"
                  value={editForm.area}
                  onChange={e => setEditForm(f => ({ ...f, area: e.target.value }))}
                />
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
                  <Button type="submit" disabled={editOfficerMutation.isPending}>Save Changes</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
