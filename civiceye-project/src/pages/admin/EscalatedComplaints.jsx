import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/services/api';
import { Card, CardHeader, CardContent, CardTitle, GradientCard } from '@/components/ui/card';
import Table from '@/components/table';
import { Button } from '@/components/ui/button';
import { AlertTriangle, UserPlus, ChevronDown, ChevronUp } from 'lucide-react';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';

export default function AdminEscalatedComplaints() {
  const queryClient = useQueryClient();
  const [expandedRow, setExpandedRow] = useState(null);
  const [assignOfficerId, setAssignOfficerId] = useState({});

  const { data: officers = [] } = useQuery({
    queryKey: ['admin-officers'],
    queryFn: async () => {
      const res = await adminAPI.getAllOfficers();
      return res.data.data || [];
    },
    staleTime: 300_000,
  });

  const { data: escalatedComplaints = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-escalated-complaints'],
    queryFn: async () => {
      const res = await adminAPI.getAllComplaints({ escalated: true });
      return (res.data.complaints || []).map((item) => ({
        ...item,
        delayed: new Date(item.createdAt) < new Date(Date.now() - 72 * 60 * 60 * 1000),
      }));
    },
    staleTime: 60_000,
  });

  const assignMutation = useMutation({
    mutationFn: ({ complaintId, officerId }) => adminAPI.assignOfficer(complaintId, officerId),
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries(['admin-complaints']);
      queryClient.invalidateQueries(['admin-officers']);
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

  const delayedComplaints = useMemo(
    () => escalatedComplaints.filter((c) => c.delayed || c.status !== 'Resolved'),
    [escalatedComplaints]
  );

  const columns = [
    { key: 'issueId', label: 'Issue ID' },
    { key: 'title', label: 'Title' },
    { key: 'location', label: 'Area' },
    { key: 'category', label: 'Category' },
    { key: 'priority', label: 'Priority' },
    { key: 'status', label: 'Status' },
    { key: 'escalationLevel', label: 'Escalation Level' },
    { key: 'assignedOfficer', label: 'Assigned Officer' },
    { key: 'createdAt', label: 'Reported' },
    { key: 'actions', label: 'Actions' },
  ];

  const handleAssign = (complaint) => {
    const officerId = assignOfficerId[complaint._id] || complaint.assignedOfficer?._id;
    if (!officerId) {
      alert('Select a senior officer first.');
      return;
    }
    assignMutation.mutate({ complaintId: complaint._id, officerId });
  };

  const handleEscalate = (complaint) => {
    if (!window.confirm('Confirm escalation of this complaint?')) return;
    escalateMutation.mutate(complaint._id);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-900">Escalated Complaints</h1>
          <span className="inline-flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 uppercase tracking-wider">
            <AlertTriangle className="h-4 w-4" /> Urgent (red)
          </span>
        </div>

        <Card className="overflow-x-auto">
          <CardHeader>
            <CardTitle>Delayed + Escalated Issues (Real-time)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table
              columns={columns}
              data={delayedComplaints}
              isLoading={isLoading}
              emptyMessage="No escalated delayed complaints found"
              renderRow={(complaint) => (
                <React.Fragment key={complaint._id}>
                  <tr
                    className={`border-b ${complaint.urgent ? 'bg-rose-50' : 'bg-white'} hover:bg-slate-50 transition`}
                  >
                    <td className="px-4 py-3 font-mono text-xs font-bold text-slate-700">{complaint.issueId}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{complaint.title}</td>
                    <td className="px-4 py-3 text-slate-700">{complaint.location}</td>
                    <td className="px-4 py-3 text-slate-700">{complaint.category}</td>
                    <td className="px-4 py-3"><PriorityBadge priority={complaint.priority?.toLowerCase() || 'low'} /></td>
                    <td className="px-4 py-3"><StatusBadge status={complaint.status?.toLowerCase() || 'pending'} /></td>
                    <td className="px-4 py-3 font-semibold text-blue-700">{complaint.escalationLevel || 0}</td>
                    <td className="px-4 py-3 text-slate-700">{complaint.assignedOfficer?.name || 'Unassigned'}</td>
                    <td className="px-4 py-3 text-slate-600">{new Date(complaint.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 flex flex-col gap-2">
                      <div className="flex gap-2">
                        <select
                          className="rounded border border-slate-300 px-2 py-1 text-sm"
                          value={assignOfficerId[complaint._id] || (complaint.assignedOfficer?._id || '')}
                          onChange={(e) => setAssignOfficerId((prev) => ({ ...prev, [complaint._id]: e.target.value }))}
                        >
                          <option value="">Senior Officer</option>
                          {officers.map((off) => (
                            <option key={off._id} value={off._id}>{off.name}</option>
                          ))}
                        </select>
                        <Button size="xs" onClick={() => handleAssign(complaint)} disabled={assignMutation.isLoading}>
                          Assign
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button size="xs" variant="ghost" onClick={() => handleEscalate(complaint)} disabled={escalateMutation.isLoading || complaint.escalated}>
                          Escalate
                        </Button>
                        <Button size="xs" variant="ghost" onClick={() => setExpandedRow(expandedRow === complaint._id ? null : complaint._id)}>
                          {expandedRow === complaint._id ? <ChevronUp /> : <ChevronDown />} Timeline
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {expandedRow === complaint._id && (
                    <tr className="bg-slate-50">
                      <td colSpan={10} className="px-6 py-4">
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-sm text-slate-700">
                            <div><strong>Reported:</strong> {new Date(complaint.createdAt).toLocaleString()}</div>
                            <div><strong>Urgent:</strong> {complaint.urgent ? 'Yes' : 'No'}</div>
                          </div>
                          <div className="bg-white border border-slate-200 rounded-lg p-4">
                            <p className="font-bold text-slate-800 mb-2">Escalation Timeline</p>
                            {!complaint.escalationTimeline?.length ? (
                              <div className="p-2 text-xs text-slate-500">No escalation events yet.</div>
                            ) : (
                              <ol className="space-y-2">
                                {complaint.escalationTimeline.map((event, idx) => (
                                  <li key={idx} className="flex gap-3">
                                    <span className="h-2 w-2 mt-1 rounded-full bg-blue-500" />
                                    <div>
                                      <div className="text-xs text-slate-600">Level {event.level} · {new Date(event.date).toLocaleString()}</div>
                                      <div className="text-sm text-slate-800">{event.note || 'Escalation update'}</div>
                                      {event.officer && <div className="text-xs text-slate-500">Senior officer: {event.officer.name || event.officer}</div>}
                                    </div>
                                  </li>
                                ))}
                              </ol>
                            )}
                          </div>
                        </div>
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
