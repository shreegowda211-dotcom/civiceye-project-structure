import React, { useMemo, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '@/services/api';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import Table from '@/components/table';
import { Button } from '@/components/ui/button';
import { Star, User, MessageCircle, BarChart2 } from 'lucide-react';

function StarRating({ rating }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div className="flex items-center gap-1 text-yellow-500">
      {Array.from({ length: 5 }).map((_, idx) => {
        if (idx < full) return <Star key={idx} className="h-4 w-4" />;
        if (idx === full && half) return <Star key={idx} className="h-4 w-4 opacity-60" />;
        return <Star key={idx} className="h-4 w-4 opacity-30" />;
      })}
    </div>
  );
}

export default function AdminFeedbackMonitoring() {
  const [expandedRow, setExpandedRow] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-feedback'],
    queryFn: async () => {
      const res = await adminAPI.getAllFeedback();
      return res.data;
    },
    staleTime: 60_000,
  });

  const feedback = data?.data || [];
  const avgRating = data?.averageRating || 0;
  const avgSatisfaction = data?.averageSatisfaction || 0;

  const satisfactionLevel = useMemo(() => {
    if (avgSatisfaction >= 85) return 'Excellent';
    if (avgSatisfaction >= 70) return 'Good';
    if (avgSatisfaction >= 50) return 'Fair';
    return 'Needs Improvement';
  }, [avgSatisfaction]);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-slate-50 min-h-[calc(100vh-90px)]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Admin Feedback Monitoring</h1>
            <p className="mt-1 text-slate-300 max-w-xl">Live insights into citizen feedback with officer ratings and satisfaction score.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 w-full lg:w-auto">
            <Card className="border-emerald-300/50 bg-emerald-950/60">
              <CardContent>
                <div className="flex items-center gap-2 text-emerald-200"> <BarChart2 className="h-5 w-5" /> <span className="font-semibold">Avg Rating</span></div>
                <p className="text-3xl font-bold text-white">{avgRating.toFixed(2)}</p>
                <p className="text-sm text-emerald-300">out of 5 from {feedback.length} feedbacks</p>
              </CardContent>
            </Card>
            <Card className="border-cyan-300/50 bg-cyan-950/60">
              <CardContent>
                <div className="flex items-center gap-2 text-cyan-200"> <Star className="h-5 w-5" /> <span className="font-semibold">Avg Satisfaction</span></div>
                <p className="text-3xl font-bold text-white">{avgSatisfaction.toFixed(1)}%</p>
                <p className="text-sm text-cyan-300">{satisfactionLevel}</p>
              </CardContent>
            </Card>
            <Card className="border-violet-300/50 bg-violet-950/60">
              <CardContent>
                <div className="flex items-center gap-2 text-violet-200"> <User className="h-5 w-5" /> <span className="font-semibold">Feedback Count</span></div>
                <p className="text-3xl font-bold text-white">{feedback.length}</p>
                <p className="text-sm text-violet-300">Most recent first</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="border-slate-700/70 bg-slate-900/80">
          <CardHeader>
            <CardTitle className="text-white">Citizen Feedback</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table
              columns={[
                { key: 'complaint', label: 'Complaint' },
                { key: 'citizen', label: 'Citizen' },
                { key: 'officer', label: 'Officer' },
                { key: 'rating', label: 'Rating' },
                { key: 'satisfaction', label: 'Satisfaction' },
                { key: 'created', label: 'Date' },
                { key: 'actions', label: 'Actions' },
              ]}
              data={feedback}
              isLoading={isLoading}
              emptyMessage="Nothing found"
              renderRow={(item) => (
                <React.Fragment key={item._id}>
                  <tr className="border-b border-slate-700 hover:bg-slate-800/60 transition">
                    <td className="px-4 py-3 text-sm text-slate-100">{item.complaint?.issueId || 'N/A'} - {item.complaint?.title || 'No title'}</td>
                    <td className="px-4 py-3 text-sm text-slate-100">{item.citizen?.name || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-slate-100">{item.officer?.name || 'N/A'}</td>
                    <td className="px-4 py-3"><StarRating rating={item.rating || 0} /></td>
                    <td className="px-4 py-3 text-slate-100">{item.satisfactionScore}%</td>
                    <td className="px-4 py-3 text-slate-200">{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <Button
                        size="xs"
                        variant="outline"
                        className="rounded-md"
                        onClick={() => setExpandedRow(expandedRow === item._id ? null : item._id)}
                      >
                        {expandedRow === item._id ? 'Hide' : 'Details'}
                      </Button>
                    </td>
                  </tr>
                  {expandedRow === item._id && (
                    <tr className="bg-slate-800">
                      <td colSpan={7} className="px-6 py-3 text-sm text-slate-200">
                        <p className="mb-1"><strong>Comment:</strong> {item.comments || 'No comment provided'}</p>
                        <p><strong>Escalation level:</strong> {item.complaint?.escalationLevel || 0}</p>
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
