import React from 'react';
import Table from '@/components/table';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';

export default function RecentComplaintsTable({ complaints }) {
  return (
    <Table
      columns={[
        { key: 'issueId', label: 'Issue ID' },
        { key: 'title', label: 'Title' },
        { key: 'priority', label: 'Priority' },
        { key: 'status', label: 'Status' },
        { key: 'createdAt', label: 'Reported' },
      ]}
      data={complaints}
      emptyMessage="No recent complaints"
      renderRow={(complaint) => (
        <tr key={complaint._id}>
          <td className="px-4 py-3 font-mono text-blue-600">{complaint.issueId}</td>
          <td className="px-4 py-3 text-slate-800">{complaint.title}</td>
          <td className="px-4 py-3"><PriorityBadge priority={(complaint.priority || '').toLowerCase()} /></td>
          <td className="px-4 py-3"><StatusBadge status={(complaint.status || '').toLowerCase()} /></td>
          <td className="px-4 py-3 text-slate-500">{new Date(complaint.createdAt).toLocaleDateString()}</td>
        </tr>
      )}
    />
  );
}
