import React from "react";
import { Link } from "react-router-dom";

export default function Register() {
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
            <div className="inline-flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-2 backdrop-blur">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/15">
                <span className="h-5 w-5 rounded-xl border-2 border-white/80" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold">Join CivicEye</p>
                <p className="text-xs text-sky-100/90">Be Part of Smart Governance</p>
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

            {/* Role selector */}
            <div className="mt-6">
              <label className="block text-xs font-medium text-slate-700">
                Select Your Role
              </label>
              <div className="mt-2 grid grid-cols-3 gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs font-medium">
                <button className="rounded-md bg-white px-2 py-2 text-slate-900 shadow-sm">
                  Citizen
                </button>
                <button className="rounded-md px-2 py-2 text-slate-600 hover:bg-white">
                  Officer
                </button>
                <button className="rounded-md px-2 py-2 text-slate-600 hover:bg-white">
                  Admin
                </button>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Report &amp; track issues
              </p>
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
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
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
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
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
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
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
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
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

