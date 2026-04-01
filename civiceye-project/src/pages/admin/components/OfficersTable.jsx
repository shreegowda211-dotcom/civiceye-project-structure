import React from "react";
import { BarChart2, Eye, Loader2, Shield, Trash2 } from "lucide-react";

function OfficerPerformanceBar({ score }) {
  return (
    <div className="w-full rounded-full bg-slate-200 h-2.5">
      <div className="h-2.5 rounded-full bg-emerald-500" style={{ width: `${score || 0}%` }} />
    </div>
  );
}

function WorkloadIndicator({ count, maxCount }) {
  const activeCount = typeof count === "number" ? count : 0;
  const max = Math.max(1, typeof maxCount === "number" ? maxCount : 1);
  const level = activeCount <= 2 ? "low" : activeCount <= 5 ? "medium" : "high";
  const badgeClasses =
    level === "low" ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
    level === "medium" ? "bg-amber-100 text-amber-800 border-amber-200" :
    "bg-rose-100 text-rose-800 border-rose-200";
  const barClasses = level === "low" ? "bg-emerald-500" : level === "medium" ? "bg-amber-500" : "bg-rose-500";
  const pct = Math.min(100, Math.round((activeCount / max) * 100));
  return (
    <div className="flex items-center gap-2">
      <span className={`rounded border px-2 py-1 text-[11px] font-semibold ${badgeClasses}`}>{level === "low" ? "Low" : level === "medium" ? "Medium" : "High"}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200"><div className={`h-2 ${barClasses}`} style={{ width: `${pct}%` }} /></div>
      <span className="text-xs font-semibold">{activeCount}</span>
    </div>
  );
}

export default function OfficersTable({
  officers,
  isLoading,
  maxActiveComplaintsCount,
  onView,
  onToggleStatus,
  onDelete,
  onAssignComplaint,
  processingId,
}) {
  if (isLoading) {
    return <div className="space-y-2 p-4">{Array.from({ length: 7 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-200/70" />)}</div>;
  }
  if (!officers.length) {
    return <div className="p-10 text-center text-slate-500">No officers found</div>;
  }
  return (
    <div className="overflow-auto">
      <table className="w-full min-w-[1200px] text-sm">
        <thead className="sticky top-0 bg-slate-100">
          <tr className="border-b border-slate-200">
            <th className="px-3 py-3 text-left">Officer ID</th>
            <th className="px-3 py-3 text-left">Name</th>
            <th className="px-3 py-3 text-left">Department</th>
            <th className="px-3 py-3 text-left">Area</th>
            <th className="px-3 py-3 text-left">Status</th>
            <th className="px-3 py-3 text-left">Assigned</th>
            <th className="px-3 py-3 text-left">Active Workload</th>
            <th className="px-3 py-3 text-left">Performance</th>
            <th className="px-3 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {officers.map((o) => (
            <tr key={o._id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="px-3 py-3 font-mono text-xs">{o.officerId || "-"}</td>
              <td className="px-3 py-3 font-medium">{o.name}</td>
              <td className="px-3 py-3">{o.department}</td>
              <td className="px-3 py-3">{o.area || "-"}</td>
              <td className="px-3 py-3">
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${o.isActive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                  {o.isActive ? "Active" : "Blocked"}
                </span>
              </td>
              <td className="px-3 py-3">{o.complaintsAssigned}</td>
              <td className="px-3 py-3 min-w-[230px]"><WorkloadIndicator count={o.activeComplaintsCount} maxCount={maxActiveComplaintsCount} /></td>
              <td className="px-3 py-3 min-w-[130px]"><OfficerPerformanceBar score={o.performance} /><span className="ml-2 text-xs text-slate-500">{o.performance}%</span></td>
              <td className="px-3 py-3">
                <div className="flex items-center justify-center gap-1">
                  <button onClick={() => onView(o)} className="rounded p-2 hover:bg-slate-100" title="View">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button onClick={() => onToggleStatus(o)} className="rounded p-2 hover:bg-amber-50" title={o.isActive ? "Block" : "Unblock"}>
                    {processingId === o._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4 text-amber-600" />}
                  </button>
                  <button onClick={() => onAssignComplaint(o)} className="rounded p-2 hover:bg-emerald-50" title="Assign Complaint">
                    <BarChart2 className="h-4 w-4 text-emerald-600" />
                  </button>
                  <button onClick={() => onDelete(o)} className="rounded p-2 hover:bg-rose-50" title="Delete">
                    <Trash2 className="h-4 w-4 text-rose-600" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

