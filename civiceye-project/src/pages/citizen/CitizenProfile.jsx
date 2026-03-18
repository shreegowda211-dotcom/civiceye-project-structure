import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Breadcrumb from '@/components/common/Breadcrumb';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { profileAPI } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CitizenProfile() {
  const { user } = useAuth();
  const [editMode] = useState(false); // future enhancements for updating profile

  const { data, isLoading, isError } = useQuery({
    queryKey: ['citizen-profile', user?.id],
    queryFn: () => profileAPI.getCitizenProfile().then((res) => res.data.data),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return <DashboardLayout><div className="p-6">Loading profile...</div></DashboardLayout>;
  }

  if (isError) {
    return <DashboardLayout><div className="p-6">Error loading profile.</div></DashboardLayout>;
  }

  const profile = data || {};

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <Breadcrumb crumbs={[{ label: 'Citizen', to: '/citizen' }, { label: 'Profile' }]} />
        <h1 className="text-2xl font-bold">My Profile</h1>

        <Card className="p-4">
          <CardHeader className="py-2">
            <CardTitle className="text-lg font-semibold">Account Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">Name</p>
                <p className="text-lg font-semibold text-slate-800">{profile.name || user?.name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Email</p>
                <p className="text-lg font-semibold text-slate-800">{profile.email || user?.email || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Role</p>
                <p className="text-lg font-semibold text-slate-800">{profile.role || user?.role || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Registered At</p>
                <p className="text-lg font-semibold text-slate-800">{profile.createdAt ? new Date(profile.createdAt).toLocaleString() : '-'}</p>
              </div>
            </div>
            <div className="mt-6">
              <Button disabled={!editMode} className="gap-2">Update Profile</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
