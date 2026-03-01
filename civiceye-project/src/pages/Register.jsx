import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, User, Briefcase } from "lucide-react";

export default function Register() {
  const [role, setRole] = useState("Citizen");
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200 md:grid-cols-2">
        {/* Left side – brand / info */}
        <div className="relative hidden bg-gradient-to-br from-sky-800 via-sky-700 to-teal-700 p-10 text-white md:flex md:flex-col md:justify-center">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute -top-24 -right-10 h-56 w-56 rounded-full bg-sky-400 blur-3xl" />
            <div className="absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-teal-400 blur-3xl" />
          </div>

          <div className="relative z-10 space-y-6 text-center md:text-left">
            <div className="inline-flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-2 backdrop-blur-md shadow-lg">
  <ShieldCheck className="h-6 w-6 text-emerald-300" />
  <div className="leading-tight">
    <p className="text-base font-bold tracking-wide">CivicEye</p>
    <p className="text-xs text-slate-300">Be Part of Smart Governance</p>
  </div>
</div>

            <p className="mx-auto max-w-xs text-sm text-sky-100/90 md:mx-0">
              Register to report civic issues, track resolutions, and contribute
              to building better cities.
            </p>
          </div>
        </div>

        {/* Right side – registration form */}
        <div className="flex flex-col justify-center px-6 py-8 sm:px-8 md:px-10">
          <div className="mx-auto w-full max-w-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              Create Account
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Register for CivicEye platform
            </p>

           {/* Premium Role selector */}
<div className="mt-6">
  <label className="block text-xs font-medium text-slate-700">
    Select Your Role
  </label>

  <div className="mt-3 grid grid-cols-2 gap-4">

    {/* Citizen Card */}
    <button
      type="button"
      onClick={() => setRole("Citizen")}
      className={`group relative rounded-2xl border p-4 text-left transition-all duration-300 ${
        role === "Citizen"
          ? "border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100 scale-[1.03]"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`rounded-xl p-2 transition ${
            role === "Citizen"
              ? "bg-emerald-500 text-white"
              : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
          }`}
        >
          <User className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">
            Citizen
          </p>
          <p className="text-[11px] text-slate-500">
            Report & track issues
          </p>
        </div>
      </div>
    </button>

    {/* Officer Card */}
    <button
      type="button"
      onClick={() => setRole("Officer")}
      className={`group relative rounded-2xl border p-4 text-left transition-all duration-300 ${
        role === "Officer"
          ? "border-sky-500 bg-sky-50 shadow-lg shadow-sky-100 scale-[1.03]"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`rounded-xl p-2 transition ${
            role === "Officer"
              ? "bg-sky-500 text-white"
              : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
          }`}
        >
          <Briefcase className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">
            Officer
          </p>
          <p className="text-[11px] text-slate-500">
            Manage & resolve issues
          </p>
        </div>
      </div>
    </button>

  </div>
</div>

            {/* Full Name */}
            <div className="mt-6 space-y-1.5">
              <label
                htmlFor="fullName"
                className="block text-xs font-medium text-slate-700"
              >
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm transition-all duration-200 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 focus:shadow-md focus:scale-[1.01]"
              />
            </div>

            {/* Email */}
            <div className="mt-4 space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-medium text-slate-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm transition-all duration-200 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 focus:shadow-md focus:scale-[1.01]"
              />
            </div>

            {/* Password */}
            <div className="mt-4 space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-medium text-slate-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Create a strong password"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm transition-all duration-200 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 focus:shadow-md focus:scale-[1.01]"
              />
            </div>

            {/* Confirm Password */}
            <div className="mt-4 space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-medium text-slate-700"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm transition-all duration-200 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 focus:shadow-md focus:scale-[1.01]"
              />
            </div>

            {/* Create account button */}
            <button className="mt-6 w-full rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
              Create Account
            </button>

            {/* Sign in link */}
            <p className="mt-4 text-center text-xs text-slate-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-sky-700 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}      

