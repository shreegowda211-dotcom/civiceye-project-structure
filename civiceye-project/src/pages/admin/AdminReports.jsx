import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminReports() {
  return (
    <DashboardLayout>
      <div className="space-y-6 bg-slate-50/80 p-6 rounded-3xl backdrop-blur shadow-lg">
        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700">Use this module to view generated report summaries and export options. Integration with backend analytics is active when data is available.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
