import React from "react";
import { Mail, MapPin, ShieldCheck, User } from "lucide-react";

export default function OfficerModal({ officer, open, onClose }) {
  if (!open || !officer) return null;

  const stats = officer.performanceStats || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Officer Details</h3>
          <button onClick={onClose} className="rounded-lg px-2 py-1 text-sm text-slate-600 hover:bg-slate-100">Close</button>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-xl border p-3"><div className="text-xs text-slate-500">Officer ID</div><div className="font-semibold">{officer.officerId || "N/A"}</div></div>
          <div className="rounded-xl border p-3"><div className="text-xs text-slate-500">Status</div><div className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${officer.isActive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{officer.isActive ? "Active" : "Blocked"}</div></div>
          <div className="rounded-xl border p-3"><div className="text-xs text-slate-500">Name</div><div className="mt-1 flex items-center gap-2"><User className="h-4 w-4 text-slate-400" />{officer.name}</div></div>
          <div className="rounded-xl border p-3"><div className="text-xs text-slate-500">Email</div><div className="mt-1 flex items-center gap-2"><Mail className="h-4 w-4 text-slate-400" />{officer.email}</div></div>
          <div className="rounded-xl border p-3"><div className="text-xs text-slate-500">Department</div><div>{officer.department || "-"}</div></div>
          <div className="rounded-xl border p-3"><div className="text-xs text-slate-500">Area</div><div className="mt-1 flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-400" />{officer.area || "-"}</div></div>
          <div className="rounded-xl border p-3 md:col-span-2">
            <div className="mb-2 text-xs text-slate-500">Performance Stats</div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              <div className="rounded border p-2"><div className="text-[11px] text-slate-500">Total Assigned</div><div className="font-semibold">{stats.totalAssigned ?? officer.complaintsAssigned ?? 0}</div></div>
              <div className="rounded border p-2"><div className="text-[11px] text-slate-500">Resolved</div><div className="font-semibold">{stats.resolved ?? 0}</div></div>
              <div className="rounded border p-2"><div className="text-[11px] text-slate-500">Pending</div><div className="font-semibold">{stats.pending ?? 0}</div></div>
              <div className="rounded border p-2"><div className="text-[11px] text-slate-500">Avg Resolution</div><div className="font-semibold">{stats.avgResolutionTime ?? "N/A"}</div></div>
            </div>
            <div className="mt-3 inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              Best officer based on workload indicator is shown in the table.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

