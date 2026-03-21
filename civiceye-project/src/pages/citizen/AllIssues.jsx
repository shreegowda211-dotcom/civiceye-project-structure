import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IssueCard } from '@/components/common/IssueCard';
import { StatsCard } from '@/components/common/StatsCard';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  PlusCircle,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Filter,
  ArrowLeft,
  Zap,
} from 'lucide-react';

export default function AllIssues() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('All');

  // Fetch all complaints from backend
  const { data: userComplaints = [], isLoading, isError, error } = useQuery({
    queryKey: ['all-complaints', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const token = localStorage.getItem('civiceye_token');
      const res = await axios.get('http://localhost:7000/api/citizen/complaints', {
        headers: {
          'auth-token': token
        }
      });
      return res.data.complaints || [];
    },
    enabled: !!user,
  });

  const resolvedCount = userComplaints.filter((i) => i.status === 'Resolved').length;
  const inProgressCount = userComplaints.filter((i) => i.status === 'In Progress').length;
  const pendingCount = userComplaints.filter((i) => i.status === 'Pending').length;
  const rejectedCount = userComplaints.filter((i) => i.status === 'Rejected').length;

  // Filter complaints based on selected status
  const filteredComplaints = statusFilter === 'All'
    ? userComplaints
    : userComplaints.filter((c) => c.status === statusFilter);

  const statusOptions = [
    { label: 'All', icon: <FileText className="h-4 w-4" /> },
    { label: 'Pending', icon: <AlertTriangle className="h-4 w-4" />, color: 'text-blue-600' },
    { label: 'In Progress', icon: <Clock className="h-4 w-4" />, color: 'text-yellow-600' },
    { label: 'Resolved', icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-green-600' },
    { label: 'Rejected', icon: <AlertTriangle className="h-4 w-4" />, color: 'text-red-600' },
  ];

  return (
    <DashboardLayout>
      <motion.div
        className="space-y-6 bg-slate-50 p-6 rounded-lg shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* header with gradient like other pages */}
        <motion.div
          className="bg-gradient-to-r from-slate-700 via-slate-600 to-slate-800 rounded-2xl p-8 shadow-lg text-white"
          whileHover={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)' }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <motion.h1
                className="font-heading text-3xl font-bold mb-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                My Issues
              </motion.h1>
              <motion.p
                className="text-slate-200"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                View all your reported issues and track their status
              </motion.p>
            </div>
            <div className="flex gap-2">
              <motion.button
                onClick={() => navigate('/citizen')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all duration-200 font-medium"
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.3)' }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </motion.button>
              <motion.button
                onClick={() => navigate('/citizen/report')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-slate-700 hover:bg-slate-50 font-semibold shadow-lg transition-all duration-200"
                whileHover={{ scale: 1.05, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
                whileTap={{ scale: 0.95 }}
              >
                <PlusCircle className="h-4 w-4" />
                Report New
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-5 gap-3"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.08,
                delayChildren: 0.15,
              },
            },
          }}
          initial="hidden"
          animate="show"
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
            }}
          >
            <StatsCard
              title="Total"
              value={userComplaints.length}
              icon={<FileText className="h-5 w-5 text-slate-600" />}
            />
          </motion.div>
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
            }}
          >
            <StatsCard
              title="Pending"
              value={pendingCount}
              icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
            />
          </motion.div>
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
            }}
          >
            <StatsCard
              title="In Progress"
              value={inProgressCount}
              icon={<Zap className="h-5 w-5 text-blue-600" />}
              variant="warning"
            />
          </motion.div>
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
            }}
          >
            <StatsCard
              title="Resolved"
              value={resolvedCount}
              icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
              variant="success"
            />
          </motion.div>
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
            }}
          >
            <StatsCard
              title="Rejected"
              value={rejectedCount}
              icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
            />
          </motion.div>
        </motion.div>

        {/* Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl">
            <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
              <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                <Filter className="h-5 w-5" />
                Filter by Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <motion.div
                className="flex flex-wrap gap-3"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.05,
                    },
                  },
                }}
                initial="hidden"
                animate="show"
              >
                {statusOptions.map((option) => (
                  <motion.button
                    key={option.label}
                    onClick={() => setStatusFilter(option.label)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all font-medium ${
                      statusFilter === option.label
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    variants={{
                      hidden: { opacity: 0, scale: 0.8 },
                      show: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
                    }}
                  >
                    {option.icon}
                    {option.label}
                  </motion.button>
                ))}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
              <CardContent className="py-12">
                <div className="flex justify-center items-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="rounded-full h-8 w-8 border-b-2 border-emerald-600"
                  ></motion.div>
                  <p className="text-slate-600 font-medium">Loading your issues...</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Error State */}
        {isError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-lg border border-red-200 bg-red-50 rounded-xl overflow-hidden">
              <CardContent className="py-8 px-8">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-red-900 text-lg mb-2">Error Loading Issues</p>
                    <p className="text-sm text-red-700">
                      {error?.message || 'Failed to load issues'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && userComplaints.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
              <CardContent className="py-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
                >
                  <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                </motion.div>
                <p className="text-slate-600 text-lg mb-6">No issues reported yet</p>
                <motion.button
                  onClick={() => navigate('/citizen/report')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
                  whileHover={{ scale: 1.05, boxShadow: '0 15px 30px rgba(0,0,0,0.2)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  Report Your First Issue
                </motion.button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Issues Grid */}
        {!isLoading && !isError && filteredComplaints.length > 0 && (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <div className="flex items-center justify-between">
              <motion.p
                className="text-sm font-semibold text-slate-600 bg-slate-100 px-3 py-2 rounded-lg"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                Showing {filteredComplaints.length} issue{filteredComplaints.length !== 1 ? 's' : ''} {statusFilter !== 'All' && `(${statusFilter})`}
              </motion.p>
            </div>
            <motion.div
              className="grid gap-4"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.08,
                    delayChildren: 0.4,
                  },
                },
              }}
              initial="hidden"
              animate="show"
            >
              {filteredComplaints.map((issue) => (
                <motion.div
                  key={issue._id}
                  className="cursor-pointer transition-all"
                  onClick={() => navigate(`/citizen/track/${issue._id}`)}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  }}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                  }}
                >
                  <IssueCard
                    issue={issue}
                    showActions={true}
                    onViewDetails={() => navigate(`/citizen/track/${issue._id}`)}
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* No Results for Filter */}
        {!isLoading && !isError && userComplaints.length > 0 && filteredComplaints.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
              <CardContent className="py-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 100 }}
                >
                  <AlertTriangle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                </motion.div>
                <p className="text-slate-600 text-lg mb-6">
                  No issues with status: <span className="font-semibold text-slate-900">{statusFilter}</span>
                </p>
                <motion.button
                  onClick={() => setStatusFilter('All')}
                  className="border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold px-6 py-3 rounded-lg transition-all"
                  whileHover={{ scale: 1.05, backgroundColor: '#f8fafc' }}
                  whileTap={{ scale: 0.95 }}
                >
                  View All Issues
                </motion.button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
