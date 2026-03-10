import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, User, Briefcase } from "lucide-react";
import { authAPI } from "@/services/api";

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState("Citizen");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const validateForm = () => {
    console.log("✓ Validating form:", { form, role });
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setMessage({ type: "error", text: "All fields are required" });
      return false;
    }

    if (role === "Officer" && !form.department) {
      console.log("❌ Department value:", form.department);
      setMessage({ type: "error", text: "Please select a department" });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setMessage({ type: "error", text: "Invalid email format" });
      return false;
    }

    if (form.password !== form.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      let res;
      try {
        // Try role-specific registration
        if (role.toLowerCase() === "citizen") {
          console.log("📝 Sending citizen registration:", form);
          res = await authAPI.registerCitizen(form);
        } else if (role.toLowerCase() === "officer") {
          console.log("👮 Sending officer registration:", form);
          res = await authAPI.registerOfficer(form);
        } else {
          console.log("📋 Sending generic registration:", { ...form, role });
          res = await authAPI.register({ ...form, role });
        }
      } catch (err) {
        // Fallback to generic endpoint
        if (err.response?.status === 404) {
          res = await authAPI.register({ ...form, role });
        } else throw err;
      }

      setMessage({ type: "success", text: "Registration successful ✅" });
      console.log("register response:", res.data);

      setForm({ name: "", email: "", password: "", confirmPassword: "", department: "" });
      setRole("Citizen");

      // Navigate to Login page after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("❌ Registration failed:", err);
      const errorMsg = err.response?.data?.message || 
                       err.message || 
                       "Registration failed. Please try again.";
      setMessage({
        type: "error",
        text: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200 md:grid-cols-2">
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
              Register to report civic issues, track resolutions, and contribute to building better cities.
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center px-6 py-8 sm:px-8 md:px-10">
          <div className="mx-auto w-full max-w-sm">
            <h2 className="text-xl font-semibold text-slate-900">Create Account</h2>
            <p className="mt-1 text-sm text-slate-500">Register for CivicEye platform</p>

            {message && (
              <div className={`mt-4 rounded p-3 text-sm shadow-sm border-l-4 ${message.type === 'error' ? 'bg-red-100 text-red-800 border-red-500' : 'bg-green-100 text-green-800 border-green-500'}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="mt-6">
                <label className="block text-xs font-medium text-slate-700">Select Your Role</label>
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <button type="button" onClick={() => setRole('Citizen')} aria-pressed={role === 'Citizen'} className={`group relative rounded-2xl border p-4 text-left transition-all duration-300 ${role === 'Citizen' ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100 scale-[1.03]' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`rounded-xl p-2 transition ${role === 'Citizen' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'}`}>
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Citizen</p>
                        <p className="text-[11px] text-slate-500">Report & track issues</p>
                      </div>
                    </div>
                  </button>

                  <button type="button" onClick={() => setRole('Officer')} aria-pressed={role === 'Officer'} className={`group relative rounded-2xl border p-4 text-left transition-all duration-300 ${role === 'Officer' ? 'border-sky-500 bg-sky-50 shadow-lg shadow-sky-100 scale-[1.03]' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`rounded-xl p-2 transition ${role === 'Officer' ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'}`}>
                        <Briefcase className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Officer</p>
                        <p className="text-[11px] text-slate-500">Manage & resolve issues</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="mt-6 space-y-1.5">
                <label 
                 htmlFor="name" 
                 className="block text-xs font-medium text-slate-700">
                  Full Name
                </label>

                <input 
                 id="name" 
                 type="text" 
                 value={form.name} 
                 onChange={handleChange} 
                 placeholder="Enter your full name" 
                 className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" 
                />
              </div>

              <div className="mt-4 space-y-1.5">
                <label 
                 htmlFor="email" 
                 className="block text-xs font-medium text-slate-700">
                  Email
                </label>

                <input 
                 id="email" 
                 type="email" 
                 value={form.email} 
                 onChange={handleChange} 
                 placeholder="you@example.com" 
                 className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" 
                />
              </div>

              <div className="mt-4 space-y-1.5">
                <label 
                htmlFor="password" 
                 className="block text-xs font-medium text-slate-700">
                  Password
                </label>

                <input 
                 id="password" 
                 type="password" 
                 value={form.password} 
                 onChange={handleChange} 
                 placeholder="Create a strong password" 
                 className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" 
                 />
              </div>

              <div className="mt-4 space-y-1.5">
                <label 
                htmlFor="confirmPassword" 
                 className="block text-xs font-medium text-slate-700">
                  Confirm Password
                </label>
                
                <input 
                 id="confirmPassword" 
                 type="password" 
                 value={form.confirmPassword} 
                 onChange={handleChange} 
                 placeholder="Confirm your password"
                 className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" />
              </div>

              {role === 'Officer' && (
                <div className="mt-4 space-y-1.5">
                  <label 
                   htmlFor="department" 
                   className="block text-xs font-medium text-slate-700">
                    Department *
                  </label>
                  
                  <select 
                   id="department" 
                   value={form.department} 
                   onChange={handleChange} 
                   className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100">
                    <option value="">Select a department...</option>
                    <option value="Road Damage">Road Damage</option>
                    <option value="Garbage">Garbage</option>
                    <option value="Streetlight">Streetlight</option>
                    <option value="Water Leakage">Water Leakage</option>
                    <option value="Other">Other</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">Select the category of issues you will handle</p>
                </div>
              )}

              <button 
               type="submit" 
               disabled={loading} 
               className="mt-6 w-full rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50">
                {loading ? 'Registering...' : 'Create Account'}
              </button>

              <p className="mt-4 text-center text-xs text-slate-600">
                Already have an account? 
                 <Link to="/login" 
                  className="font-semibold text-sky-700 hover:underline">
                    Sign in
                  </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
