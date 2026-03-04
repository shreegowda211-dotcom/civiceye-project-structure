import React from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function IssueTracking() {
  const { issueId } = useParams();

  // TODO: fetch issue details from backend using issueId if available

  return (
    <DashboardLayout role="Citizen">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">
            {issueId ? 'Issue Details' : 'Track Issues'}
          </h1>
          <p className="text-muted-foreground">
            {issueId
              ? 'View the current status and updates of your issue'
              : 'Search and track the status of your reported issues'}
          </p>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Issue Tracking</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <p className="text-slate-500">
              {issueId
                ? `Loading issue details for #${issueId}...`
                : 'Enter an issue ID to track its status'}
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
