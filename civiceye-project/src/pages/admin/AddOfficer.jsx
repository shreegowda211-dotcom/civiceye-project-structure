import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/services/api';
import { Users, Eye, EyeOff, Plus, Copy, Check, Mail, Lock, Building2 } from 'lucide-react';

export default function AddOfficer() {
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [showCreatedPassword, setShowCreatedPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [createdOfficer, setCreatedOfficer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: 'Road Damage'
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Mutation for adding officer
  const addOfficerMutation = useMutation({
    mutationFn: async (officerData) => {
      const res = await adminAPI.createOfficer(officerData);
      return res.data;
    },
    onSuccess: (data) => {
      setSuccessMessage('Officer added successfully!');
      setCreatedOfficer({ ...data.data, password: formData.password });
      setFormData({ name: '', email: '', password: '', department: 'Road Damage' });
      queryClient.invalidateQueries(['admin-officers']);
      setTimeout(() => setSuccessMessage(''), 5000);
    },
    onError: (error) => {
      setError(error.response?.data?.message || 'Failed to add officer');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('All fields are required');
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    addOfficerMutation.mutate(formData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 bg-slate-50 p-6 rounded-lg shadow-lg">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-purple-800 rounded-2xl p-8 shadow-lg text-white">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8" />
            <div>
              <h1 className="font-heading text-3xl font-bold mb-2">Add New Officer 👮</h1>
              <p className="text-purple-100">Create a new officer account and assign to a department</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-700 font-semibold flex items-center gap-2">
            ✅ {successMessage}
          </div>
        )}

        {/* Add Officer Form Card */}
        <Card className="bg-white shadow-lg border-0 rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-xl">
            <CardTitle className="text-2xl font-semibold flex items-center gap-2">
              <Plus className="h-6 w-6" />
              Officer Registration Form
            </CardTitle>
          </CardHeader>

          <CardContent className="p-8 bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 font-semibold flex items-center gap-2">
                  <span>❌</span> {error}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                {/* Name Field */}
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-slate-700">Officer Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter officer's full name"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all"
                    required
                  />
                </div>

                {/* Email Field */}
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-slate-700">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter officer's email"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all"
                    required
                  />
                </div>

                {/* Password Field */}
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-slate-700">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter password (min 6 characters)"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Department Field */}
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-slate-700">Department *</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full text-black px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all bg-white"
                    required
                  >
                    <option value="Road Damage">Road Damage</option>
                    <option value="Garbage">Garbage</option>
                    <option value="Streetlight">Streetlight</option>
                    <option value="Water Leakage">Water Leakage</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-6 border-t border-slate-200">
                <button
                  type="submit"
                  disabled={addOfficerMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {addOfficerMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Adding Officer...
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5" />
                      Add Officer
                    </>
                  )}
                </button>
                <button
                  type="reset"
                  onClick={() => {
                    setFormData({ name: '', email: '', password: '', department: 'Road Damage' });
                    setError('');
                  }}
                  className="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all"
                >
                  Clear
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Created Officer Info Section */}
        {createdOfficer && (
          <Card className="bg-emerald-50 border border-emerald-300 rounded-xl overflow-hidden shadow-lg">
            <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-t-xl">
              <CardTitle className="text-2xl font-semibold flex items-center gap-2">
                <Check className="h-6 w-6" />
                Officer Created Successfully! ✓
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 bg-white">
              <div className="space-y-4">
                {/* Officer Name */}
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 font-semibold">Officer Name</p>
                      <p className="text-xl font-bold text-slate-900">{createdOfficer.name}</p>
                    </div>
                    <Users className="h-8 w-8 text-emerald-600" />
                  </div>
                </div>

                {/* Email */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-slate-600 font-semibold mb-1">Email Address</p>
                      <p className="text-lg font-mono text-slate-900">{createdOfficer.email}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(createdOfficer.email)}
                      className="ml-2 p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                      title="Copy email"
                    >
                      {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Password */}
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-slate-600 font-semibold mb-1">Password</p>
                      <p className="text-lg font-mono text-slate-900">
                        {showCreatedPassword ? createdOfficer.password : '••••••'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowCreatedPassword(!showCreatedPassword)}
                        className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-all"
                        title={showCreatedPassword ? 'Hide password' : 'Show password'}
                      >
                        {showCreatedPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(createdOfficer.password)}
                        className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-all"
                        title="Copy password"
                      >
                        {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Department */}
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 font-semibold">Department</p>
                      <p className="text-lg font-bold text-slate-900">{createdOfficer.department}</p>
                    </div>
                    <Building2 className="h-8 w-8 text-orange-600" />
                  </div>
                </div>

                {/* Created Date */}
                <div className="bg-slate-100 rounded-lg p-4 border border-slate-200">
                  <p className="text-sm text-slate-600 font-semibold">Created At</p>
                  <p className="text-sm text-slate-700">
                    {new Date(createdOfficer.createdAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </p>
                </div>

                {/* Clear Button */}
                <button
                  onClick={() => setCreatedOfficer(null)}
                  className="w-full mt-4 px-6 py-3 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-all"
                >
                  Clear and Add Another Officer
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Section */}
        <Card className="bg-blue-50 border border-blue-200 rounded-xl overflow-hidden">
          <CardHeader className="bg-blue-100 border-b border-blue-200">
            <CardTitle className="text-base text-blue-700">ℹ️ Important Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ul className="space-y-2 text-sm text-slate-700">
              <li>✓ Officer will be assigned to handle issues in the selected department</li>
              <li>✓ Email must be unique - no duplicate emails allowed</li>
              <li>✓ Password must be at least 6 characters long</li>
              <li>✓ Officer can login and view assigned complaints immediately</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
