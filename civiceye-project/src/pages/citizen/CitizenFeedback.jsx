import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Breadcrumb from '@/components/common/Breadcrumb';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { citizenAPI } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, MessageCircle, CheckCircle2 } from 'lucide-react';

export default function CitizenFeedback() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({ complaintId: '', officerId: '', rating: 5, satisfactionScore: 80, comments: '' });
  const [message, setMessage] = useState('');

  const { data: feedbackList = [], isLoading: feedbackLoading } = useQuery({
    queryKey: ['citizen-feedback', user?.id],
    queryFn: () => citizenAPI.getFeedback().then((res) => res.data.data || []),
    enabled: !!user,
    staleTime: 60 * 1000,
  });

  const createFeedbackMutation = useMutation({
    mutationFn: (payload) => citizenAPI.submitFeedback(payload),
    onSuccess: () => {
      setMessage('Feedback submitted successfully');
      queryClient.invalidateQueries(['citizen-feedback', user?.id]);
      setForm({ complaintId: '', officerId: '', rating: 5, satisfactionScore: 80, comments: '' });
    },
    onError: (error) => {
      setMessage(error?.response?.data?.message || 'Failed to submit feedback');
    },
  });

  const submitHandler = (event) => {
    event.preventDefault();
    if (!form.complaintId || !form.officerId) {
      setMessage('Complaint and officer are required');
      return;
    }
    createFeedbackMutation.mutate(form);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <Breadcrumb crumbs={[{ label: 'Citizen', to: '/citizen' }, { label: 'Feedback' }]} />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-900">Provide Feedback</h1>
          <div className="text-sm text-slate-500">Your feedback helps improve response quality.</div>
        </div>
        <Card className="p-4">
          <CardHeader className="py-2">
            <CardTitle className="text-lg font-semibold">Submit Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitHandler} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Complaint ID</label>
                <input value={form.complaintId} onChange={(e) => setForm((f) => ({ ...f, complaintId: e.target.value }))} placeholder="Complaint Mongo ID" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Officer ID</label>
                <input value={form.officerId} onChange={(e) => setForm((f) => ({ ...f, officerId: e.target.value }))} placeholder="Officer Mongo ID" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Rating (1-5)</label>
                  <input type="number" min="1" max="5" value={form.rating} onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) }))} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Satisfaction (%)</label>
                  <input type="number" min="0" max="100" value={form.satisfactionScore} onChange={(e) => setForm((f) => ({ ...f, satisfactionScore: Number(e.target.value) }))} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Comments</label>
                <textarea value={form.comments} onChange={(e) => setForm((f) => ({ ...f, comments: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2" rows={3}></textarea>
              </div>
              {message && <p className="text-sm text-emerald-600">{message}</p>}
              <Button type="submit" className="gap-2" disabled={createFeedbackMutation.isLoading}><Star className="h-4 w-4" /> Submit Feedback</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader className="py-2">
            <CardTitle className="text-lg font-semibold">Your Feedback History</CardTitle>
          </CardHeader>
          <CardContent>
            {feedbackLoading ? (
              <p>Loading feedback...</p>
            ) : (
              <div className="space-y-3">
                {feedbackList.length === 0 && <p className="text-slate-600">No feedback submitted yet.</p>}
                {feedbackList.map((item) => (
                  <div key={item._id} className="rounded-lg border border-slate-200 p-3 bg-slate-50">
                    <div className="flex justify-between">
                      <div className="text-sm text-slate-700">Complaint: {item.complaint?.issueId || item.complaint?._id}</div>
                      <span className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm">Officer: {item.officer?.name || item.officer?.email}</p>
                    <p className="text-sm">Rating: {item.rating}/5</p>
                    <p className="text-sm">Satisfaction: {item.satisfactionScore}%</p>
                    {item.comments && <p className="text-sm text-slate-600">Comments: {item.comments}</p>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
