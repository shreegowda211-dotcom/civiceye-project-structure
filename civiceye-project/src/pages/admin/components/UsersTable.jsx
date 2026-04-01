import React from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Eye, Loader2, Shield, Trash2, Users } from "lucide-react";

function SortIcon({ active, direction }) {
  if (!active) return <ArrowUpDown className="h-4 w-4 text-slate-400" />;
  return direction === "asc" ? (
    <ArrowUp className="h-4 w-4 text-slate-700" />
  ) : (
    <ArrowDown className="h-4 w-4 text-slate-700" />
  );
}

function HeadCell({ label, field, sort, onSort }) {
  const active = sort.field === field;
  return (
    <th className="px-4 py-3 text-left">
      <button onClick={() => onSort(field)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
        {label}
        <SortIcon active={active} direction={sort.direction} />
      </button>
    </th>
  );
}

export default function UsersTable({
  users,
  isLoading,
  sort,
  onSort,
  onDelete,
  onToggleBlock,
  onView,
  deletingId,
  togglingBlockId,
}) {
  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-200/70" />
        ))}
      </div>
    );
  }

  if (!users.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
        <Users className="h-10 w-10 text-slate-400" />
        <div className="text-sm font-semibold text-slate-900">No users found</div>
      </div>
    );
  }

  return (
    <div className="max-h-[560px] overflow-auto">
      <table className="w-full min-w-[900px] text-sm">
        <thead className="sticky top-0 z-10 bg-slate-100">
          <tr className="border-b border-slate-200">
            <HeadCell label="Name" field="name" sort={sort} onSort={onSort} />
            <HeadCell label="Email" field="email" sort={sort} onSort={onSort} />
            <HeadCell label="Role" field="role" sort={sort} onSort={onSort} />
            <HeadCell label="Status" field="blocked" sort={sort} onSort={onSort} />
            <HeadCell label="Joined" field="createdAt" sort={sort} onSort={onSort} />
            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id} className="border-b border-slate-100 transition-colors hover:bg-white/80">
              <td className="px-4 py-3 font-medium text-slate-900">{u.name || "N/A"}</td>
              <td className="px-4 py-3 text-slate-700">{u.email || "N/A"}</td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                  {u.role || "N/A"}
                </span>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    u.blocked ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {u.blocked ? "Blocked" : "Active"}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-600">
                {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-center gap-1">
                  {/*
                    Titles serve as lightweight tooltips while keeping the table responsive.
                  */}
                  <button
                    onClick={() => onView(u)}
                    className="rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                    title="View Details"
                    aria-label="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onToggleBlock(u)}
                    disabled={togglingBlockId === u._id}
                    className="rounded-md p-2 text-amber-600 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
                    title={u.blocked ? "Unblock User" : "Block User"}
                    aria-label={u.blocked ? "Unblock User" : "Block User"}
                  >
                    {togglingBlockId === u._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Shield className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => onDelete(u)}
                    disabled={deletingId === u._id}
                    className="rounded-md p-2 text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                    title="Delete User"
                    aria-label="Delete User"
                  >
                    {deletingId === u._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
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

