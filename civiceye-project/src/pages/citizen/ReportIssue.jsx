import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { citizenAPI } from '@/services/api';

export default function ReportIssue() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Road Damage',
    priority: 'Low',
    location: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.title || !form.description || !form.location) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    try {
      setLoading(true);
      const res = await citizenAPI.reportIssue(form);

      setMessage({ type: 'success', text: 'Issue reported successfully! ✅' });
      
      // Clear form
      setForm({
        title: '',
        description: '',
        category: 'Road Damage',
        priority: 'Low',
        location: ''
      });

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/citizen');
      }, 2000);

    } catch (error) {
      console.error('Error reporting issue:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to report issue. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/citizen');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 bg-slate-50 p-6 rounded-lg shadow-lg">
        {/* header with gradient to match dashboards */}
        <div className="bg-gradient-to-r from-slate-700 via-slate-600 to-slate-800 rounded-2xl p-8 shadow-lg text-white">
          <h1 className="font-heading text-3xl font-bold mb-2">Report an Issue</h1>
          <p className="text-slate-200">
            Help us improve your city by reporting civic issues
          </p>
        </div>

        {message && (
          <div className={`rounded-lg p-4 ${
            message.type === 'error' 
              ? 'bg-red-100 text-red-800 border border-red-300' 
              : 'bg-green-100 text-green-800 border border-green-300'
          }`}>
            {message.text}
          </div>
        )}

        <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
            <CardTitle className="text-xl font-semibold">Issue Details</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleInputChange}
                  placeholder="Brief title of the issue"
                  className="w-full text-sm rounded-lg border border-slate-300 px-4 py-3 bg-white text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description *</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  placeholder="Detailed description"
                  rows={5}
                  className="w-full text-sm rounded-lg border border-slate-300 px-4 py-3 bg-white text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all resize-none"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                  <select 
                    name="category"
                    value={form.category}
                    onChange={handleInputChange}
                    className="w-full text-sm rounded-lg border border-slate-300 px-4 py-3 bg-white text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                  >
                    <option value="Road Damage">Road Damage</option>
                    <option value="Garbage">Garbage</option>
                    <option value="Streetlight">Streetlight</option>
                    <option value="Water Leakage">Water Leakage</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Priority</label>
                  <select 
                    name="priority"
                    value={form.priority}
                    onChange={handleInputChange}
                    className="w-full text-sm rounded-lg border border-slate-300 px-4 py-3 bg-white text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Location *</label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleInputChange}
                  placeholder="Address or location details"
                  className="w-full text-sm rounded-lg border border-slate-300 px-4 py-3 bg-white text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                  required
                />
              </div>

              <div className="flex gap-4 pt-6 border-t border-slate-200">
                <Button 
                  variant="civic" 
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  {loading ? 'Submitting...' : 'Submit Report'}
                </Button>
                <Button 
                  variant="ghost" 
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="px-6 py-3 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg transition-all"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
