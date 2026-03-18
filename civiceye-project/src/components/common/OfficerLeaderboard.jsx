import React from 'react';

export default function OfficerLeaderboard({ officers }) {
  // officers: [{ name, resolvedCount, totalAssigned }]
  const sorted = [...officers].sort((a, b) => b.resolvedCount - a.resolvedCount);
  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">Rank</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">Officer</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">Resolved</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">Assigned</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">Resolution Rate</th>
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr><td colSpan={5} className="text-center py-8 text-slate-400">No officer data</td></tr>
          ) : (
            sorted.map((officer, idx) => (
              <tr key={officer._id || officer.name} className="border-b border-slate-100">
                <td className="px-4 py-3 font-bold text-lg text-emerald-600">{idx + 1}</td>
                <td className="px-4 py-3">{officer.name}</td>
                <td className="px-4 py-3">{officer.resolvedCount}</td>
                <td className="px-4 py-3">{officer.totalAssigned}</td>
                <td className="px-4 py-3">{officer.totalAssigned ? Math.round((officer.resolvedCount / officer.totalAssigned) * 100) : 0}%</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
