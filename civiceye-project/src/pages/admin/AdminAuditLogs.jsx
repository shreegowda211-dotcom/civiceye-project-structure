import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '@/services/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function AdminAuditLogs() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: () => adminAPI.getAuditLogs().then(res => res.data),
    staleTime: 60_000,
  });

  return (
    <DashboardLayout>
      <Card className="my-6">
        <CardHeader>
          <CardTitle>Admin Audit Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <div>Loading...</div>}
          {isError && <div className="text-red-500">Failed to load audit logs.</div>}
          {data && data.data && data.data.length === 0 && <div>No audit logs found.</div>}
          {data && data.data && data.data.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-slate-800 text-slate-200">
                    <th className="px-3 py-2">Timestamp</th>
                    <th className="px-3 py-2">Admin</th>
                    <th className="px-3 py-2">Action</th>
                    <th className="px-3 py-2">Target Type</th>
                    <th className="px-3 py-2">Target ID</th>
                    <th className="px-3 py-2">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map(log => (
                    <tr key={log._id} className="border-b border-slate-700">
                      <td className="px-3 py-2 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{log.adminId?.name || 'N/A'}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{log.action}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{log.targetType}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{log.targetId}</td>
                      <td className="px-3 py-2 whitespace-pre-wrap max-w-xs">{JSON.stringify(log.details, null, 2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
