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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Report an Issue</h1>
          <p className="text-muted-foreground">
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

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Issue Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleInputChange}
                  placeholder="Brief title of the issue"
                  className="w-full text-sm rounded border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Description *</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  placeholder="Detailed description"
                  rows={4}
                  className="w-full text-sm rounded border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Category</label>
                <select 
                  name="category"
                  value={form.category}
                  onChange={handleInputChange}
                  className="w-full text-sm rounded border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="Road Damage">Road Damage</option>
                  <option value="Garbage">Garbage</option>
                  <option value="Streetlight">Streetlight</option>
                  <option value="Water Leakage">Water Leakage</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Priority</label>
                <select 
                  name="priority"
                  value={form.priority}
                  onChange={handleInputChange}
                  className="w-full text-sm rounded border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Location *</label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleInputChange}
                  placeholder="Address or location details"
                  className="w-full text-sm rounded border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  variant="civic" 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Report'}
                </Button>
                <Button 
                  variant="ghost" 
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
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
