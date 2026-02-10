import React from "react";

export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 md:px-8 lg:px-10">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900">
            <span className="h-5 w-5 rounded-xl border-2 border-white/70" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-slate-900">
              CivicEye
            </div>
            <div className="text-[11px] text-slate-500">
              Smart Issue Reporting
            </div>
          </div>
        </div>

        {/* Auth actions */}
        <div className="flex items-center gap-4 text-sm">
          <button className="text-slate-600 hover:text-slate-900">
            Login
          </button>
          <button className="rounded-lg bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
            Register
          </button>
        </div>
      </div>
    </header>
  );
}

