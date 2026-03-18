import React, { useState, useMemo } from 'react';
import Breadcrumb from '@/components/common/Breadcrumb';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { adminAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';

export default function AdminAreas() {
  const queryClient = useQueryClient();

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editArea, setEditArea] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', description: '', assignedOfficer: '' });
  const [assigning, setAssigning] = useState(false);

  const { data: officers = [], isLoading: loadingOfficers } = useQuery({
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

  const { data: areas = [], isLoading: loadingAreas } = useQuery({
    queryKey: ['admin-areas'],
    queryFn: async () => {
      try {
        const res = await adminAPI.getAllAreas();
        return res.data.data || [];
      } catch (err) {
        console.warn('adminAPI.getAllAreas failed', err?.message || err);
        return [];
      }
    },
    staleTime: 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: (data) => adminAPI.createArea(data),
    onSuccess: () => { queryClient.invalidateQueries(['admin-areas']); setShowAdd(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminAPI.updateArea(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['admin-areas']); setShowEdit(false); setEditArea(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminAPI.deleteArea(id),
    onSuccess: () => queryClient.invalidateQueries(['admin-areas']),
  });

  const assignMutation = useMutation({
    mutationFn: ({ id, officerId }) => adminAPI.assignOfficerToArea(id, officerId),
    onSuccess: () => { queryClient.invalidateQueries(['admin-areas']); setAssigning(false); },
  });

  const officerOptions = useMemo(() => officers || [], [officers]);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <Breadcrumb crumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Areas' }]} />
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Manage Areas & Zones</h1>
          <div className="flex items-center gap-2">
            <Button onClick={() => { setForm({ name: '', code: '', description: '', assignedOfficer: '' }); setShowAdd(true); }} className="gap-2"><Plus className="h-4 w-4" /> Add Area</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
              <h2 className="text-lg font-semibold mb-3">Areas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {loadingAreas ? <div>Loading...</div> : (
                  (areas || []).map(a => (
                    <div key={a._id || a.name} className="p-3 border rounded-lg bg-slate-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-slate-900">{a.name}</div>
                          <div className="text-sm text-slate-600">{a.code || '-'}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => { setEditArea(a); setForm({ name: a.name, code: a.code || '', description: a.description || '', assignedOfficer: a.assignedOfficer?._id || '' }); setShowEdit(true); }}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(a._id)}><Trash2 className="h-4 w-4 text-rose-500" /></Button>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-slate-700">{a.description || '-'}</div>
                      <div className="mt-3 text-xs text-slate-600">Assigned: {a.assignedOfficer?.name || '-'}</div>
                      <div className="mt-3 flex gap-2">
                        <select value={form.assignedOfficer} onChange={(e) => setForm(f => ({ ...f, assignedOfficer: e.target.value }))} className="px-2 py-1 rounded border bg-white">
                          <option value="">Unassigned</option>
                          {officerOptions.map(o => (<option key={o._id} value={o._id}>{o.name}</option>))}
                        </select>
                        <Button size="sm" onClick={() => { setAssigning(true); assignMutation.mutate({ id: a._id, officerId: form.assignedOfficer || '' }); }} disabled={!form.assignedOfficer || assigning}>Assign</Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 h-full">
              <h2 className="text-lg font-semibold mb-3">Map (placeholder)</h2>
              <div className="w-full h-64 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                <MapPin className="h-6 w-6 mr-2" /> Map integration placeholder
              </div>
              <p className="mt-3 text-sm text-slate-600">This section will become an interactive map for area boundaries and officer overlays.</p>
            </div>
          </div>
        </div>

        {/* Add Modal */}
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Add New Area</h2>
              <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }} className="space-y-3">
                <input className="w-full border rounded px-3 py-2" placeholder="Name" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                <input className="w-full border rounded px-3 py-2" placeholder="Code" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} />
                <textarea className="w-full border rounded px-3 py-2" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" type="button" onClick={() => setShowAdd(false)}>Cancel</Button>
                  <Button type="submit" disabled={createMutation.isPending}>Create</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Edit Area</h2>
              <form onSubmit={(e) => { e.preventDefault(); if (!editArea) return; updateMutation.mutate({ id: editArea._id, data: form }); }} className="space-y-3">
                <input className="w-full border rounded px-3 py-2" placeholder="Name" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                <input className="w-full border rounded px-3 py-2" placeholder="Code" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} />
                <textarea className="w-full border rounded px-3 py-2" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                <select value={form.assignedOfficer} onChange={e => setForm(f => ({ ...f, assignedOfficer: e.target.value }))} className="w-full border rounded px-3 py-2">
                  <option value="">Unassigned</option>
                  {officerOptions.map(o => (<option key={o._id} value={o._id}>{o.name}</option>))}
                </select>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" type="button" onClick={() => { setShowEdit(false); setEditArea(null); }}>Cancel</Button>
                  <Button type="submit" disabled={updateMutation.isPending}>Save</Button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
