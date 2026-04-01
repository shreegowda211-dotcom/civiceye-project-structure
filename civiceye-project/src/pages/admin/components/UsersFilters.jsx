import React from "react";
import { Search } from "lucide-react";

export default function UsersFilters({
  searchInput,
  onSearchInputChange,
  statusFilter,
  onStatusFilterChange,
}) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
      <div className="relative md:col-span-6">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={searchInput}
          onChange={(e) => onSearchInputChange(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full rounded-xl border border-slate-200 bg-white/70 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none ring-emerald-500/30 focus:ring-2"
        />
      </div>

      <select
        value={statusFilter}
        onChange={(e) => onStatusFilterChange(e.target.value)}
        className="md:col-span-3 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500/30 focus:ring-2"
      >
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="blocked">Blocked</option>
      </select>
    </div>
  );
}

