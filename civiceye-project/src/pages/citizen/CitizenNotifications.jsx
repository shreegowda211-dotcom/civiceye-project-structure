import React from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Breadcrumb from '@/components/common/Breadcrumb';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { citizenAPI } from '@/services/api';
import { safeQuery } from '@/lib/safeQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle2 } from 'lucide-react';

export default function CitizenNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['citizen-notifications', user?.id],
    queryFn: safeQuery(() => citizenAPI.getNotifications().then((res) => res.data.data), []),
    enabled: !!user,
    staleTime: 30 * 1000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => citizenAPI.markNotificationRead(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries(['citizen-notifications']);
      await queryClient.invalidateQueries(['citizen-profile']);
    },
  });

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <Breadcrumb crumbs={[{ label: 'Citizen', to: '/citizen' }, { label: 'Notifications' }]} />
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <div className="text-sm text-slate-500">Stay informed about your complaints.</div>
        </div>

        <Card className="p-4">
          <CardHeader className="py-2">
            <CardTitle className="text-lg font-semibold">Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading notifications...</p>
            ) : (notifications.length === 0 ? (
              <p className="text-slate-600">No notifications yet.</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((note) => (
                  <div
                    key={note._id}
                    className={`rounded-lg border p-3 cursor-pointer ${note.read ? 'border-slate-200 bg-white' : 'border-emerald-400 bg-emerald-50'} ${markReadMutation.isLoading ? 'opacity-80' : 'hover:shadow-lg'}`}
                    onClick={() => {
                      if (!note.read) {
                        markReadMutation.mutate(note._id);
                      }
                    }}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="font-semibold text-slate-800">{note.type.toUpperCase()}</div>
                        <div className="text-sm text-slate-700">{note.message}</div>
                        <div className="text-xs text-slate-500 mt-1">{new Date(note.createdAt).toLocaleString()}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!note.read ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-emerald-700"
                            onClick={(event) => {
                              event.stopPropagation();
                              markReadMutation.mutate(note._id);
                            }}
                            disabled={markReadMutation.isLoading}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Mark as read
                          </Button>
                        ) : (
                          <span className="text-xs text-slate-500">Read</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
