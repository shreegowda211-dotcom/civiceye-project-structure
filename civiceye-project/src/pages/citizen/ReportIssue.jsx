import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ReportIssue() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: implement form submission to backend
  };

  return (
    <DashboardLayout role="Citizen">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Report an Issue</h1>
          <p className="text-muted-foreground">
            Help us improve your city by reporting civic issues
          </p>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Issue Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Title</label>
                <input
                  type="text"
                  placeholder="Brief title of the issue"
                  className="w-full text-sm rounded border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  placeholder="Detailed description"
                  rows={4}
                  className="w-full text-sm rounded border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Category</label>
                <select className="w-full text-sm rounded border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100">
                  <option>Select a category</option>
                  <option>Road Damage</option>
                  <option>Garbage</option>
                  <option>Streetlight</option>
                  <option>Water Leakage</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Priority</label>
                <select className="w-full text-sm rounded border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100">
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Location</label>
                <input
                  type="text"
                  placeholder="Address or location details"
                  className="w-full text-sm rounded border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button variant="civic" type="submit">
                  Submit Report
                </Button>
                <Button variant="ghost" type="button">
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
