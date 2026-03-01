import React from "react";
import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200 md:grid-cols-2">
        {/* Left side – brand panel */}
        <div className="relative hidden bg-gradient-to-br from-sky-800 via-sky-700 to-teal-700 p-10 text-white md:flex md:flex-col md:justify-center">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute -top-24 -right-10 h-56 w-56 rounded-full bg-sky-400 blur-3xl" />
            <div className="absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-teal-400 blur-3xl" />
          </div>

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-2 backdrop-blur">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/15">
                <span className="h-5 w-5 rounded-xl border-2 border-white/80" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold">CivicEye</p>
                <p className="text-xs text-sky-100/90">
                  Smart Public Issue Reporting System
                </p>
              </div>
            </div>

            <p className="max-w-xs text-sm text-sky-100/90">
              Sign in to access your dashboard and manage civic issues
              efficiently, in real time.
            </p>
          </div>
        </div>

        {/* Right side – form card */}
        <div className="flex flex-col justify-center px-6 py-8 sm:px-8 md:px-10">
          <div className="mx-auto w-full max-w-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              Welcome Back
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Sign in to your CivicEye account
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
            </div>

            {/* Email */}
            <div className="mt-6 space-y-1.5">
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
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-sky-500/0 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            {/* Password */}
            <div className="mt-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-slate-700"
                >
                  Password
                </label>
                <button className="text-xs font-medium text-sky-700 hover:underline">
                  Forgot password?
                </button>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-sky-500/0 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            {/* Sign in button */}
            <button className="mt-6 w-full rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
              Sign In
            </button>

            {/* Register link */}
            <p className="mt-4 text-center text-xs text-slate-600">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-sky-700 hover:underline"
              >
                Register here
              </Link>
            </p>

            {/* Demo access box */}
            <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-xs text-slate-600">
              <p className="font-semibold text-slate-800">Demo Access</p>
              <p className="mt-1">
                Use any email and password to login. Select your role above to
                access different dashboards.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

