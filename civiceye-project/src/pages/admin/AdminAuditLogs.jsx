import React, { useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  AlertTriangle,
  ArrowRightLeft,
  Calendar,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FilePlus,
  Pencil,
  Search,
  Trash2,
  User,
} from "lucide-react";

const ACTION_OPTIONS = ["Create", "Update", "Delete", "Assign", "Escalate"];
const TARGET_OPTIONS = ["Complaint", "Officer", "Citizen", "Area", "Settings"];

const DUMMY_LOGS = [
  {
    id: "AL-0001",
    adminName: "Shree Admin",
    action: "Create",
    targetType: "Officer",
    targetId: "OFF-1007",
    description: "Created officer profile and assigned department & area.",
    timestamp: "2026-03-29T10:22:10.000Z",
    details: {
      officerId: "OFF-1007",
      email: "officer1007@civiceye.local",
      department: "Road Damage",
      area: "Ward 12",
      createdFields: ["name", "email", "department", "area", "officerId"],
    },
  },
  {
    id: "AL-0002",
    adminName: "Shree Admin",
    action: "Assign",
    targetType: "Complaint",
    targetId: "CMP-2026-0319",
    description: "Assigned complaint to OFF-1007 based on area match and workload.",
    timestamp: "2026-03-29T10:26:42.000Z",
    details: {
      complaintId: "CMP-2026-0319",
      area: "Ward 12",
      assignedOfficerId: "OFF-1007",
      strategy: "smart_auto_assign",
      workloadAtAssignment: 3,
    },
  },
  {
    id: "AL-0003",
    adminName: "Asha Admin",
    action: "Update",
    targetType: "Settings",
    targetId: "SYS-SETTINGS",
    description: "Updated escalation SLA and notification templates.",
    timestamp: "2026-03-29T13:05:00.000Z",
    details: {
      previous: { escalationDays: 7, notificationTemplateVersion: 2 },
      next: { escalationDays: 5, notificationTemplateVersion: 3 },
    },
  },
  {
    id: "AL-0004",
    adminName: "Asha Admin",
    action: "Escalate",
    targetType: "Complaint",
    targetId: "CMP-2026-0288",
    description: "Escalated complaint due to SLA breach (auto escalation review).",
    timestamp: "2026-03-30T05:32:19.000Z",
    details: {
      complaintId: "CMP-2026-0288",
      reason: "SLA breach",
      previousPriority: "Normal",
      nextPriority: "High",
      escalationType: "admin_escalation",
    },
  },
  {
    id: "AL-0005",
    adminName: "Shree Admin",
    action: "Delete",
    targetType: "Area",
    targetId: "AREA-19",
    description: "Deleted area mapping and rebalanced officer assignments.",
    timestamp: "2026-03-30T08:12:03.000Z",
    details: {
      areaId: "AREA-19",
      areaName: "Ward 19",
      affectedOfficers: ["OFF-1003", "OFF-1010"],
      followUp: "reassignment_required",
    },
  },
];

function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function ActionBadge({ action }) {
  const cfg = {
    Create: { icon: FilePlus, cls: "bg-emerald-500/15 text-emerald-700 ring-emerald-600/20" },
    Update: { icon: Pencil, cls: "bg-sky-500/15 text-sky-700 ring-sky-600/20" },
    Delete: { icon: Trash2, cls: "bg-rose-500/15 text-rose-700 ring-rose-600/20" },
    Assign: { icon: ArrowRightLeft, cls: "bg-violet-500/15 text-violet-700 ring-violet-600/20" },
    Escalate: { icon: AlertTriangle, cls: "bg-orange-500/15 text-orange-700 ring-orange-600/20" },
  }[action] || { icon: ClipboardList, cls: "bg-slate-500/15 text-slate-700 ring-slate-600/20" };

  const Icon = cfg.icon;

  return (
    <span
      className={classNames(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        cfg.cls
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {action}
    </span>
  );
}

export default function AdminAuditLogs() {
  const [actionType, setActionType] = useState("");
  const [targetType, setTargetType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const filteredLogs = useMemo(() => {
    const s = search.trim().toLowerCase();
    const fromTs = fromDate ? new Date(`${fromDate}T00:00:00.000Z`).getTime() : null;
    const toTs = toDate ? new Date(`${toDate}T23:59:59.999Z`).getTime() : null;

    return DUMMY_LOGS.filter((log) => {
      if (actionType && log.action !== actionType) return false;
      if (targetType && log.targetType !== targetType) return false;

      const ts = new Date(log.timestamp).getTime();
      if (fromTs != null && ts < fromTs) return false;
      if (toTs != null && ts > toTs) return false;

      if (s) {
        const hay = `${log.adminName} ${log.action} ${log.targetType} ${log.targetId} ${log.description}`.toLowerCase();
        if (!hay.includes(s)) return false;
      }

      return true;
    });
  }, [actionType, targetType, fromDate, toDate, search]);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mt-2 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-slate-900" />
            <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
          </div>
          <p className="text-sm text-slate-600">Track all admin actions and system activities</p>
        </div>

        {/* Filters */}
        <div className="mt-6 rounded-2xl border border-white/40 bg-white/60 p-4 shadow-xl shadow-slate-900/5 backdrop-blur">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
            <div className="md:col-span-3">
              <label className="text-xs font-semibold text-slate-700">Action Type</label>
              <div className="relative mt-1">
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500/30 focus:ring-2"
                >
                  <option value="">All Actions</option>
                  {ACTION_OPTIONS.map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="text-xs font-semibold text-slate-700">Target Type</label>
              <div className="relative mt-1">
                <select
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500/30 focus:ring-2"
                >
                  <option value="">All Targets</option>
                  {TARGET_OPTIONS.map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-700">From</label>
              <div className="relative mt-1">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500/30 focus:ring-2"
                />
                <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-700">To</label>
              <div className="relative mt-1">
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500/30 focus:ring-2"
                />
                <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Search</label>
              <div className="relative mt-1">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Admin name or action..."
                  className="w-full rounded-xl border border-slate-200 bg-white/70 px-9 py-2 text-sm text-slate-900 outline-none ring-emerald-500/30 focus:ring-2"
                />
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
            <div>
              Showing <span className="font-semibold text-slate-900">{filteredLogs.length}</span> of{" "}
              <span className="font-semibold text-slate-900">{DUMMY_LOGS.length}</span> logs
            </div>
            <button
              type="button"
              onClick={() => {
                setActionType("");
                setTargetType("");
                setFromDate("");
                setToDate("");
                setSearch("");
                setExpandedId(null);
              }}
              className="rounded-lg border border-slate-200 bg-white/70 px-3 py-1.5 font-semibold text-slate-700 hover:bg-white"
            >
              Reset filters
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="mt-5 rounded-2xl border border-white/40 bg-white/60 shadow-xl shadow-slate-900/5 backdrop-blur">
          <div className="flex items-center justify-between border-b border-white/40 px-4 py-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-slate-600" />
              <div className="text-sm font-semibold text-slate-900">Activity</div>
            </div>
            <div className="text-xs text-slate-600">Click a row to expand details</div>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-14 text-center">
              <ClipboardList className="h-10 w-10 text-slate-400" />
              <div className="text-sm font-semibold text-slate-900">No logs available</div>
              <div className="text-xs text-slate-600">Try adjusting filters or search terms.</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[980px] w-full text-sm">
                <thead>
                  <tr className="bg-slate-900/90 text-slate-100">
                    <th className="w-10 px-4 py-3 text-left"></th>
                    <th className="px-4 py-3 text-left font-semibold">Admin Name</th>
                    <th className="px-4 py-3 text-left font-semibold">Action</th>
                    <th className="px-4 py-3 text-left font-semibold">Target Type</th>
                    <th className="px-4 py-3 text-left font-semibold">Target ID</th>
                    <th className="px-4 py-3 text-left font-semibold">Description</th>
                    <th className="px-4 py-3 text-left font-semibold">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => {
                    const isExpanded = expandedId === log.id;
                    return (
                      <React.Fragment key={log.id}>
                        <tr
                          onClick={() => setExpandedId((prev) => (prev === log.id ? null : log.id))}
                          className={classNames(
                            "cursor-pointer border-b border-white/40 transition-colors",
                            "hover:bg-white/70",
                            isExpanded ? "bg-white/70" : "bg-transparent"
                          )}
                        >
                          <td className="px-4 py-3 align-top">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-slate-600" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-slate-600" />
                            )}
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="font-semibold text-slate-900">{log.adminName}</div>
                            <div className="text-xs text-slate-500">ID: {log.id}</div>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <ActionBadge action={log.action} />
                          </td>
                          <td className="px-4 py-3 align-top">
                            <span className="rounded-lg bg-slate-900/5 px-2 py-1 text-xs font-semibold text-slate-800">
                              {log.targetType}
                            </span>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <span className="font-mono text-xs text-slate-800">{log.targetId}</span>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="max-w-[520px] text-slate-800">{log.description}</div>
                          </td>
                          <td className="px-4 py-3 align-top whitespace-nowrap text-slate-700">
                            {formatTime(log.timestamp)}
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="border-b border-white/40 bg-white/60">
                            <td className="px-4 py-4"></td>
                            <td className="px-4 py-4" colSpan={6}>
                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-xl border border-slate-200/70 bg-white/70 p-4">
                                  <div className="text-xs font-semibold text-slate-700">Full action description</div>
                                  <div className="mt-2 text-sm text-slate-900">{log.description}</div>
                                  <div className="mt-3 text-xs text-slate-600">
                                    <span className="font-semibold text-slate-900">Time:</span> {formatTime(log.timestamp)}
                                  </div>
                                </div>
                                <div className="rounded-xl border border-slate-200/70 bg-white/70 p-4">
                                  <div className="text-xs font-semibold text-slate-700">JSON preview</div>
                                  <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-slate-950/90 p-3 text-xs text-slate-100">
                                    {JSON.stringify(log.details, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
