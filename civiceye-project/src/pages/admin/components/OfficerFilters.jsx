import React from "react";
import { Search } from "lucide-react";

export default function OfficerFilters({
  search,
  onSearchChange,
  department,
  onDepartmentChange,
  area,
  onAreaChange,
  status,
  onStatusChange,
  departments = [],
}) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
      <div className="relative md:col-span-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name/email/officerId..."
          className="w-full rounded-xl border border-slate-200 bg-white/70 py-2 pl-9 pr-3 text-sm"
        />
      </div>
      <select value={department} onChange={(e) => onDepartmentChange(e.target.value)} className="md:col-span-3 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm">
        <option value="">All Departments</option>
        {departments.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
      <input
        value={area}
        onChange={(e) => onAreaChange(e.target.value)}
        placeholder="Filter area"
        className="md:col-span-3 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm"
      />
      <select value={status} onChange={(e) => onStatusChange(e.target.value)} className="md:col-span-2 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm">
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="blocked">Blocked</option>
      </select>
    </div>
  );
}

