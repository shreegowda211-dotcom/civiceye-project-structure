import React from 'react';
import Breadcrumb from '@/components/common/Breadcrumb';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, GradientCard } from '@/components/ui/card';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/services/api';
import { Users, Mail, Calendar, Lock, Trash2, Building2, SlidersHorizontal } from 'lucide-react';

const areaStats = [
  { ward: 'Ward 1', issues: 140, resolved: 98 },
  { ward: 'Ward 2', issues: 175, resolved: 147 },
  { ward: 'Ward 3', issues: 196, resolved: 160 },
  { ward: 'Ward 4', issues: 212, resolved: 178 },
  { ward: 'Ward 5', issues: 132, resolved: 104 },
  { ward: 'Ward 6', issues: 154, resolved: 125 },
  { ward: 'Ward 7', issues: 188, resolved: 150 },
  { ward: 'Ward 8', issues: 170, resolved: 130 },
];

const renderProgressBar = (percentage) => (
  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
    <div className="h-2 bg-emerald-500" style={{ width: `${percentage}%` }} />
  </div>
);

export default function AdminDepartments() {
  const queryClient = useQueryClient();

  const deleteOfficerMutation = useMutation({
    mutationFn: (officerId) => adminAPI.deleteOfficer(officerId),
    onSuccess: () => queryClient.invalidateQueries(['admin-officers']),
  });

  const { data: officers = [], isLoading, isError } = useQuery({
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
    staleTime: 1000 * 60,
  });

  const formatDate = (value) => {
    if (!value) return 'N/A';
    try {
      return new Date(value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 bg-slate-50/80 p-6 rounded-3xl backdrop-blur shadow-lg">
        <Breadcrumb crumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Departments' }]} />
        <div className="bg-white/70 border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h1 className="font-sans text-3xl font-bold text-slate-900">Department Officer Management</h1>
          <p className="mt-1 text-sm text-slate-600">Sync roster, clearance and ward distribution with the data backend.</p>
        </div>

        <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-700 to-blue-800 text-black rounded-t-xl">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              Officer Management
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-slate-700">Name</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-700">Email</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-700">Password</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-700">Role</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-700">Clearance</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-700">Joined</th>
                  <th className="px-6 py-3 text-center font-semibold text-slate-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-500">Loading officers...</td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-red-500">Failed to fetch officers.</td>
                  </tr>
                ) : officers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-500">No officers found.</td>
                  </tr>
                ) : (
                  officers.map((officer) => (
                    <tr key={officer._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{officer.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-slate-600 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-slate-400" />
                        {officer.email || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-slate-600">••••••••</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">{officer.role || 'Officer'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-full bg-cyan-100 text-cyan-700 text-xs font-semibold">{officer.clearance || 'Standard'}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{formatDate(officer.createdAt)}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => deleteOfficerMutation.mutate(officer._id)}
                          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" />Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-emerald-700 to-emerald-800 text-black rounded-t-xl">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5" /> Area-wise Issue Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-slate-700">Ward</th>
                    <th className="px-6 py-3 text-right font-semibold text-slate-700">Total Issues</th>
                    <th className="px-6 py-3 text-right font-semibold text-slate-700">Resolved %</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-700">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {areaStats.map((ward) => {
                    const resolvedRate = ward.issues ? Math.round((ward.resolved / ward.issues) * 100) : 0;
                    return (
                      <tr key={ward.ward} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3 text-slate-900">{ward.ward}</td>
                        <td className="px-6 py-3 text-right text-slate-600">{ward.issues}</td>
                        <td className="px-6 py-3 text-right text-slate-600">{resolvedRate}%</td>
                        <td className="px-6 py-3">
                          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-2 bg-emerald-500" style={{ width: `${resolvedRate}%` }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
