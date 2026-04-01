import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Breadcrumb from '@/components/common/Breadcrumb';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { citizenAPI } from '@/services/api';
import { safeQuery } from '@/lib/safeQuery';
import { Card, CardContent, CardHeader, CardTitle, GradientCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, MessageCircle, CheckCircle2 } from 'lucide-react';

export default function CitizenFeedback() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({ complaintId: '', officerId: '', rating: 5, satisfactionScore: 80, comments: '' });
  const [message, setMessage] = useState('');

  const { data: feedbackList = [], isLoading: feedbackLoading } = useQuery({
    queryKey: ['citizen-feedback', user?.id],
    queryFn: safeQuery(() => citizenAPI.getFeedback().then((res) => res.data.data), []),
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
      <motion.div
        className="p-6 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Breadcrumb crumbs={[{ label: 'Citizen', to: '/citizen' }, { label: 'Feedback' }]} />
        <motion.div
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-slate-900">Provide Feedback</h1>
          <div className="text-sm text-slate-500">Your feedback helps improve response quality.</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          whileHover={{ boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
        >
          <Card className="p-4 shadow-lg border-0 rounded-xl overflow-hidden">
            <CardHeader className="py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-t-lg">
              <CardTitle className="text-lg font-semibold">Submit Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <motion.form
                onSubmit={submitHandler}
                className="space-y-4"
                variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
                initial="hidden"
                animate="show"
              >
                <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                  <label className="block text-sm font-medium text-slate-700">Complaint ID</label>
                  <motion.input
                    value={form.complaintId}
                    onChange={(e) => setForm((f) => ({ ...f, complaintId: e.target.value }))}
                    placeholder="Complaint Mongo ID"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none"
                    whileFocus={{ scale: 1.02 }}
                  />
                </motion.div>
                <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                  <label className="block text-sm font-medium text-slate-700">Officer ID</label>
                  <motion.input
                    value={form.officerId}
                    onChange={(e) => setForm((f) => ({ ...f, officerId: e.target.value }))}
                    placeholder="Officer Mongo ID"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none"
                    whileFocus={{ scale: 1.02 }}
                  />
                </motion.div>
                <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Rating (1-5)</label>
                    <motion.input
                      type="number"
                      min="1"
                      max="5"
                      value={form.rating}
                      onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) }))}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none"
                      whileFocus={{ scale: 1.02 }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Satisfaction (%)</label>
                    <motion.input
                      type="number"
                      min="0"
                      max="100"
                      value={form.satisfactionScore}
                      onChange={(e) => setForm((f) => ({ ...f, satisfactionScore: Number(e.target.value) }))}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none"
                      whileFocus={{ scale: 1.02 }}
                    />
                  </div>
                </motion.div>
                <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                  <label className="block text-sm font-medium text-slate-700">Comments</label>
                  <motion.textarea
                    value={form.comments}
                    onChange={(e) => setForm((f) => ({ ...f, comments: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none"
                    rows={3}
                    whileFocus={{ scale: 1.02 }}
                  ></motion.textarea>
                </motion.div>
                {message && (
                  <motion.p
                    className="text-sm text-emerald-600 font-medium"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {message}
                  </motion.p>
                )}
                <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                  <motion.button
                    type="submit"
                    className="gap-2 inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    disabled={createFeedbackMutation.isLoading}
                    whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(0,0,0,0.15)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Star className="h-4 w-4" /> Submit Feedback
                  </motion.button>
                </motion.div>
              </motion.form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          whileHover={{ boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
        >
          <Card className="p-4 shadow-lg border-0 rounded-xl overflow-hidden">
            <CardHeader className="py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
              <CardTitle className="text-lg font-semibold">Your Feedback History</CardTitle>
            </CardHeader>
            <CardContent>
              {feedbackLoading ? (
                <motion.div
                  className="flex justify-center items-center gap-3 py-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="rounded-full h-6 w-6 border-b-2 border-blue-600"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  ></motion.div>
                  <p className="text-slate-600 font-medium">Loading feedback...</p>
                </motion.div>
              ) : (
                <motion.div
                  className="space-y-3"
                  variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
                  initial="hidden"
                  animate="show"
                >
                  {feedbackList.length === 0 && (
                    <motion.p
                      className="text-slate-600"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      No feedback submitted yet.
                    </motion.p>
                  )}
                  {feedbackList.map((item) => (
                    <motion.div
                      key={item._id}
                      className="rounded-lg border border-slate-200 p-3 bg-slate-50 hover:bg-slate-100 transition-colors"
                      variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }}
                      whileHover={{ scale: 1.02, boxShadow: '0 10px 20px rgba(0,0,0,0.08)' }}
                    >
                      <div className="flex justify-between">
                        <div className="text-sm text-slate-700">Complaint: {item.complaint?.issueId || item.complaint?._id}</div>
                        <span className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm mt-2">Officer: {item.officer?.name || item.officer?.email}</p>
                      <p className="text-sm">Rating: {item.rating}/5</p>
                      <p className="text-sm">Satisfaction: {item.satisfactionScore}%</p>
                      {item.comments && <p className="text-sm text-slate-600 mt-2">Comments: {item.comments}</p>}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
