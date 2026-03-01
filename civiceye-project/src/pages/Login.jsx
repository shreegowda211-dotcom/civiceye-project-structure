import React, { useState } from "react";
import { Link } from "react-router-dom";
import { User, Briefcase, Shield } from "lucide-react";
import axios from "axios";

export default function Login() {
  const [role, setRole] = useState("Citizen");
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.id]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setMessage({ type: "error", text: "Email and password are required" });
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:7000/api/login", {
        ...form,
        role,
      });
      const successMsg = { type: "success", text: "Login successful ✅" };
      setMessage(successMsg);
      console.log("set message", successMsg);
      console.log(res.data);
      // redirect based on role if needed
    } catch (error) {
      const errMsg = {
        type: "error",
        text: error.response?.data?.message || "Login failed ❌",
      };
      setMessage(errMsg);
      console.log("set message", errMsg);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


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
            <div className="inline-flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-2 backdrop-blur-md shadow-lg">
          <Shield className="h-6 w-6 text-emerald-300" />
  <div className="leading-tight">
    <p className="text-base font-bold tracking-wide text-white">
      CivicEye
    </p>
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

            {/* flash message */}
            {console.log("Login render message", message)}
            {message && (
              <div
                className={`mt-4 rounded p-3 text-sm shadow-sm border-l-4
                  ${
                    message.type === "error"
                      ? "bg-red-100 text-red-800 border-red-500"
                      : "bg-green-100 text-green-800 border-green-500"
                  }`}
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
            {/* Premium Role selector */}
<div className="mt-6">
  <label className="block text-xs font-medium text-slate-700">
    Select Your Role
  </label>

  <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">

    {/* Citizen */}
    <button
      type="button"
      onClick={() => setRole("Citizen")}
      className={`group relative rounded-2xl border p-4 text-left transition-all duration-300 ${
        role === "Citizen"
          ? "border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100 scale-[1.04]"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
      }`}
      aria-pressed={role === "Citizen"}
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
          <p className="text-sm font-semibold text-slate-900">Citizen</p>
          <p className="text-[11px] text-slate-500">
            Report & track issues
          </p>
        </div>
      </div>
    </button>

    {/* Officer */}
    <button
      type="button"
      onClick={() => setRole("Officer")}
      className={`group relative rounded-2xl border p-4 text-left transition-all duration-300 ${
        role === "Officer"
          ? "border-sky-500 bg-sky-50 shadow-lg shadow-sky-100 scale-[1.04]"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
      }`}
      aria-pressed={role === "Officer"}
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
          <p className="text-sm font-semibold text-slate-900">Officer</p>
          <p className="text-[11px] text-slate-500">
            Manage & resolve issues
          </p>
        </div>
      </div>
    </button>

    {/* Admin */}
    <button
      type="button"
      onClick={() => setRole("Admin")}
      className={`group relative rounded-2xl border p-4 text-left transition-all duration-300 ${
        role === "Admin"
          ? "border-purple-500 bg-purple-50 shadow-lg shadow-purple-100 scale-[1.04]"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
      }`}
      aria-pressed={role === "Admin"}
    >
      <div className="flex items-center gap-3">
        <div
          className={`rounded-xl p-2 transition ${
            role === "Admin"
              ? "bg-purple-500 text-white"
              : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
          }`}
        >
          <Shield className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Admin</p>
          <p className="text-[11px] text-slate-500">
            Platform oversight & control
          </p>
        </div>
      </div>
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
                 value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm transition-all duration-200 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 focus:shadow-md focus:scale-[1.01]"
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
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm transition-all duration-200 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 focus:shadow-md focus:scale-[1.01]"
              />
            </div>

            {/* Sign in button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
              {loading ? "Signing In..." : "Sign In"}
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
          </form>

            {/* // Demo access box 
            <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-xs text-slate-600">
              <p className="font-semibold text-slate-800">Demo Access</p>
              <p className="mt-1">
                Use any email and password to login. Select your role above to
                access different dashboards.
              </p>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}

