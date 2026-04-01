import React from "react";
import { Calendar, Mail, ShieldCheck, User } from "lucide-react";

function formatDate(dateString) {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleString();
  } catch {
    return "N/A";
  }
}

export default function UserModal({ user, open, onClose }) {
  if (!open || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <div className="w-full max-w-xl rounded-2xl border border-white/30 bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">User Details</h3>
            <p className="text-sm text-slate-500">Detailed profile and account info</p>
          </div>
          <button onClick={onClose} className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100">
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-xs text-slate-500">Name</div>
            <div className="mt-1 flex items-center gap-2 font-semibold text-slate-900">
              <User className="h-4 w-4 text-slate-500" />
              {user.name || "N/A"}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-xs text-slate-500">Email</div>
            <div className="mt-1 flex items-center gap-2 font-semibold text-slate-900">
              <Mail className="h-4 w-4 text-slate-500" />
              {user.email || "N/A"}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-xs text-slate-500">Role</div>
            <div className="mt-1">{user.role || "N/A"}</div>
          </div>

          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-xs text-slate-500">Status</div>
            <div className="mt-1 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-slate-500" />
              {user.blocked ? "Blocked" : "Active"}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-3 md:col-span-2">
            <div className="text-xs text-slate-500">Joined</div>
            <div className="mt-1 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              {formatDate(user.createdAt)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

