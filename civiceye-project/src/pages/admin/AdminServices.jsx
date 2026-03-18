import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminServices() {
  return (
    <DashboardLayout>
      <div className="space-y-6 bg-slate-50/80 p-6 rounded-3xl backdrop-blur shadow-lg">
        <Card>
          <CardHeader>
            <CardTitle>Services Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700">This section is reserved for managing Civic service categories and workflows. Coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
