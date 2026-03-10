import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export default function TransparencyDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-8 bg-slate-50 p-6 rounded-lg shadow-lg">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-slate-700 via-slate-600 to-slate-800 rounded-2xl p-8 shadow-lg text-white">
          <h1 className="font-heading text-3xl font-bold mb-2">Analytics & Transparency 📊</h1>
          <p className="text-slate-200">
            View detailed analytics and transparency reports
          </p>
        </div>

        <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-t-xl">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analytics Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-12 px-8">
            <BarChart3 className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">
              Analytics data will be displayed here (charts, graphs, etc.)
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
