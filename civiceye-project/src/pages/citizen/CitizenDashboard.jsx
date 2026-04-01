import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, GradientCard } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { citizenAPI } from '@/services/api';
import { safeQuery } from '@/lib/safeQuery';
import {
  PlusCircle,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export default function CitizenDashboard() {
  const { user } = useAuth();

  // Fetch user's complaints from backend
  const { data: userComplaints = [], isLoading, isError, error } = useQuery({
    queryKey: ['complaints', user?.id],
    queryFn: safeQuery(async () => {
      if (!user) return [];
      const res = await citizenAPI.getAllComplaints();
      return res.data.complaints;
    }, []),
    enabled: !!user,
  });

  const resolvedCount = userComplaints.filter((i) => i.status === 'Resolved').length;
  const inProgressCount = userComplaints.filter((i) => i.status === 'In Progress').length;
  const pendingCount = userComplaints.filter((i) => i.status === 'Pending').length;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const statusBadge = (status) => {
    const badges = {
      Pending: {
        bg: 'bg-amber-100',
        text: 'text-amber-700',
        icon: AlertTriangle,
        label: 'Pending',
      },
      'In Progress': {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        icon: Zap,
        label: 'In Progress',
      },
      Resolved: {
        bg: 'bg-emerald-100',
        text: 'text-emerald-700',
        icon: CheckCircle2,
        label: 'Resolved',
      },
      Rejected: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        icon: AlertTriangle,
        label: 'Rejected',
      },
    };

    const badge = badges[status] || badges.Pending;
    const IconComponent = badge.icon;

    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${badge.bg} ${badge.text} shadow-sm hover:shadow-md`}
      >
        <IconComponent className="h-3.5 w-3.5" />
        <span>{status || 'Unknown'}</span>
      </motion.div>
    );
  };

  const filteredComplaints = userComplaints
    .filter((issue) =>
      (!statusFilter || issue.status === statusFilter) &&
      (!categoryFilter || issue.category === categoryFilter) &&
      (!searchTerm || issue.title?.toLowerCase().includes(searchTerm.toLowerCase()) || issue.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const totalFiltered = filteredComplaints.length;
  const pageCount = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const recentComplaints = filteredComplaints.slice((page - 1) * pageSize, page * pageSize);

  const categories = useMemo(() => [...new Set(userComplaints.map((item) => item.category || 'Other'))], [userComplaints]);

  const monthlyTrendData = useMemo(() => {
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthCounts = userComplaints.reduce((acc, complaint) => {
      const createdAt = complaint.createdAt ? new Date(complaint.createdAt) : null;
      if (!createdAt || Number.isNaN(createdAt.getTime())) return acc;
      const m = createdAt.getMonth();
      acc[m] = (acc[m] || 0) + 1;
      return acc;
    }, {});

    return monthNames.map((month, index) => ({
      month,
      complaints: monthCounts[index] || 0,
    }));
  }, [userComplaints]);

  const statusDistributionData = [
    { name: 'Pending', value: pendingCount },
    { name: 'In Progress', value: inProgressCount },
    { name: 'Resolved', value: resolvedCount },
  ];

  const statusColors = ['#FBBF24', '#3B82F6', '#10B981'];

  return (
    <DashboardLayout>
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <motion.div
          className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 shadow-2xl text-black"
          whileHover={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)' }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <motion.h1
                className="text-3xl font-bold"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                Citizen Dashboard
              </motion.h1>
              <motion.p
                className="text-slate-200 mt-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                Overview of your complaints and quick actions.
              </motion.p>
            </div>

          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
              },
            },
          }}
          initial="hidden"
          animate="show"
        >
          {[
            { title: 'Total Complaints', value: userComplaints.length, icon: FileText, subtitle: 'All submitted issues' },
            { title: 'Pending Complaints', value: pendingCount, icon: AlertTriangle, subtitle: 'Awaiting action' },
            { title: 'In Progress Complaints', value: inProgressCount, icon: Clock, subtitle: 'Currently being worked' },
            { title: 'Resolved Complaints', value: resolvedCount, icon: CheckCircle2, subtitle: 'Completed issues' },
          ].map((card) => (
            <motion.div
              key={card.title}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
              }}
              whileHover={{ y: -8 }}
            >
              <GradientCard title={card.title} description={card.subtitle}>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-4xl font-extrabold text-white">{card.value}</p>
                  <card.icon className="h-8 w-8 text-white/50" />
                </div>
              </GradientCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Data Visualization (Step 2) */}
        <motion.div
          className="grid grid-cols-1 xl:grid-cols-3 gap-4"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.15,
                delayChildren: 0.3,
              },
            },
          }}
          initial="hidden"
          animate="show"
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
            }}
          >
            <Card className="glass-card p-4 shadow-lg rounded-2xl border border-white/20 bg-white/20 backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:border-white/40">
              <CardHeader className="pb-2 border-b border-white/20">
                <CardTitle className="text-lg font-semibold text-black">Monthly Complaints Overview</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 h-80 min-h-[260px]">
                <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={0}>
                  <LineChart data={monthlyTrendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.2)" />
                    <XAxis dataKey="month" tick={{ fill: '#000000' }} />
                    <YAxis tick={{ fill: '#000000' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                    <Line type="monotone" dataKey="complaints" stroke="#34d399" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            className="xl:col-span-2"
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
            }}
          >
            <Card className="glass-card p-4 shadow-lg rounded-2xl border border-white/20 bg-white/20 backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:border-white/40">
                <CardHeader className="pb-2 border-b border-white/20">
                <CardTitle className="text-lg font-semibold text-black">Complaint Status Distribution</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 h-80 min-h-[260px]">
                <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={0}>
                  <PieChart>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                    <Legend verticalAlign="top" wrapperStyle={{ color: '#f8fafc' }} />
                    <Pie data={statusDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} innerRadius={55} label>
                      {statusDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={statusColors[index % statusColors.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Quick Action Section */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-4"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.4,
              },
            },
          }}
          initial="hidden"
          animate="show"
        >
          <Link to="/citizen/report" className="lg:col-span-2">
            <motion.div
              className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-500 to-emerald-400 p-6 shadow-2xl cursor-pointer transition-all"
              whileHover={{
                y: -4,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
              }}
              whileTap={{ scale: 0.98 }}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
              }}
            >
              <div className="absolute -top-6 -right-10 h-28 w-28 rounded-full bg-white opacity-20"></div>
              <div className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-white opacity-20"></div>
              <div className="flex items-center gap-4">
                <motion.div
                  className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/25 text-black"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ type: 'easeOut', duration: 0.3 }}
                >
                  <PlusCircle className="h-8 w-8" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold text-black">Report New Issue</h2>
                  <p className="text-black/90 mt-1">Quickly create a new complaint and track it in real-time.</p>
                </div>
              </div>
            </motion.div>
          </Link>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
            }}
          >
            <Card className="rounded-3xl bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg p-5 transition-all duration-300 hover:shadow-xl hover:bg-white">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Dashboard help</h3>
              <p className="text-sm text-slate-600">
                Use the table below to check your recent reports and status at a glance.
              </p>
            </Card>
          </motion.div>
        </motion.div>

        {/* Recent Complaints Table */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
          }}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.5 }}
        >
          <Card className="shadow-lg border-0 transition-all duration-300 hover:shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 text-black rounded-t-lg">
              <CardTitle className="text-2xl">Recent Complaints</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading && (
                <div className="text-center py-12">
                  <motion.div
                    className="inline-block"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <div className="h-8 w-8 border-4 border-slate-200 border-t-slate-600 rounded-full"></div>
                  </motion.div>
                  <p className="text-slate-500 mt-4">Loading your complaints...</p>
                </div>
              )}

              {isError && (
                <motion.div
                  className="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-red-600 font-semibold">Error loading complaints: {error?.message}</p>
                </motion.div>
              )}

              {!isLoading && !isError && (
                <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <motion.input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                    placeholder="Search issues..."
                    className="rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    whileFocus={{ scale: 1.02 }}
                  />
                  <motion.select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    whileFocus={{ scale: 1.02 }}
                  >
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Rejected">Rejected</option>
                  </motion.select>
                  <motion.select
                    value={categoryFilter}
                    onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                    className="rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    whileFocus={{ scale: 1.02 }}
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </motion.select>
                </div>
              )}

              {!isLoading && !isError && totalFiltered === 0 ? (
                <motion.div
                  className="text-center py-12 bg-slate-50 rounded-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 text-lg mb-6">No complaints match your filters.</p>
                </motion.div>
              ) : (
                !isLoading && !isError && (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full table-auto divide-y divide-slate-200 bg-white rounded-xl">
                        <thead className="bg-slate-100 text-left text-xs uppercase tracking-wider text-slate-600">
                          <tr>
                            <th className="px-4 py-3">Complaint Title</th>
                            <th className="px-4 py-3">Category</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">View</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {recentComplaints.map((issue) => (
                            <motion.tr
                              key={issue._id}
                              className="transition-colors duration-200"
                              whileHover={{
                                backgroundColor: '#f8fafc',
                              }}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <td className="px-4 py-3 text-slate-700 font-semibold">{issue.title || 'Untitled issue'}</td>
                              <td className="px-4 py-3 text-slate-600">{issue.category || 'N/A'}</td>
                              <td className="px-4 py-3">{statusBadge(issue.status)}</td>
                              <td className="px-4 py-3 text-slate-600">{new Date(issue.createdAt).toLocaleDateString()}</td>
                              <td className="px-4 py-3">
                                <Link to={`/citizen/issues/${issue._id}`}>
                                  <motion.div
                                    className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 transition-colors duration-200"
                                    whileHover={{ gap: '0.375rem' }}
                                  >
                                    View
                                    <ArrowRight className="h-4 w-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                                  </motion.div>
                                </Link>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-slate-600">
                      <div>
                        Showing {Math.min((page - 1) * pageSize + 1, totalFiltered)} - {Math.min(page * pageSize, totalFiltered)} of {totalFiltered} complaints
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className="rounded-md border border-slate-300 px-4 py-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          whileHover={{ backgroundColor: '#f1f5f9', scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Prev
                        </motion.button>
                        <motion.button
                          onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                          disabled={page === pageCount}
                          className="rounded-md border border-slate-300 px-4 py-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          whileHover={{ backgroundColor: '#f1f5f9', scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Next
                        </motion.button>
                      </div>
                    </div>
                  </>
                )
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.6,
              },
            },
          }}
          initial="hidden"
          animate="show"
        >
          <motion.div
            className="rounded-2xl bg-white/50 border border-slate-200 p-4 shadow-lg transition-all duration-300 hover:shadow-xl hover:bg-white"
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
            }}
          >
            <p className="text-sm font-semibold text-slate-600">Progress Summary</p>
            <div className="mt-3 h-32 w-full bg-slate-100 rounded-xl overflow-hidden shadow-inner">
              <motion.div
                className="h-full rounded-xl bg-gradient-to-r from-blue-400 to-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${Math.round((inProgressCount / Math.max(1, userComplaints.length)) * 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.7 }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-slate-500">
              <span>In Progress</span>
              <motion.span
                className="font-semibold text-slate-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.3 }}
              >
                {Math.round((inProgressCount / Math.max(1, userComplaints.length)) * 100)}%
              </motion.span>
            </div>
          </motion.div>

          <motion.div
            className="rounded-2xl bg-white/50 border border-slate-200 p-4 shadow-lg transition-all duration-300 hover:shadow-xl hover:bg-white"
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
            }}
          >
            <p className="text-sm font-semibold text-slate-600">Resolved Rate</p>
            <div className="mt-3 h-32 w-full bg-slate-100 rounded-xl overflow-hidden shadow-inner">
              <motion.div
                className="h-full rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${Math.round((resolvedCount / Math.max(1, userComplaints.length)) * 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.7 }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-slate-500">
              <span>Resolved</span>
              <motion.span
                className="font-semibold text-slate-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.3 }}
              >
                {Math.round((resolvedCount / Math.max(1, userComplaints.length)) * 100)}%
              </motion.span>
            </div>
          </motion.div>
        </motion.div>

      </motion.div>
    </DashboardLayout>
  );
}
