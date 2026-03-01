import React from "react";
import { Link } from 'react-router-dom';
import { ShieldCheck } from "lucide-react";


export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 md:px-8 lg:px-10">
        {/* Brand */}
        <div className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-2 shadow-md hover:shadow-lg transition-all duration-300">
  <ShieldCheck className="h-6 w-6 text-emerald-400" />
  <div className="leading-tight">
    <div className="text-base font-bold tracking-wide text-white">
      CivicEye
    </div>
    <div className="text-[11px] text-slate-300">
      Smart Issue Reporting
    </div>
  </div>
</div>

        {/* Auth actions */}
        <div className="flex items-center gap-4 text-sm">
          <Link to="/login" className="text-slate-600 hover:text-slate-900">Login</Link>
          <Link to="/register" className="rounded-lg bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"> Register </Link>
        </div>
      </div>
    </header>
  );
}

