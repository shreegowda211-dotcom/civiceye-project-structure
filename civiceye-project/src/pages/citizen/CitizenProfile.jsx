import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Breadcrumb from '@/components/common/Breadcrumb';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileAPI } from '@/services/api';
import { safeQuery } from '@/lib/safeQuery';
import { Card, CardContent, CardHeader, CardTitle, GradientCard } from '@/components/ui/card';

// Skeleton Loader Component (inlined in render)
const SkeletonLoader = () => null;

// Error State Component (inlined in render)
const ErrorState = () => null;

export default function CitizenProfile() {
  const { user, login } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [statusMessage, setStatusMessage] = useState('');

  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['citizen-profile', user?.id],
    queryFn: safeQuery(() => profileAPI.getCitizenProfile().then((res) => res?.data?.data), {}),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (data?.name && data?.email && (!formData.name || !formData.email)) {
      setFormData({
        name: data?.name || user?.name || '',
        email: data?.email || user?.email || '',
      });
    }
  }, [data?.name, data?.email, user?.name, user?.email]);

  const profile = data || {};

  const { mutate: updateProfile, isLoading: isSaving } = useMutation({
    mutationFn: (payload) => profileAPI.updateCitizenProfile(payload),
    onSuccess: (res) => {
      const updated = res?.data?.data;
      queryClient.invalidateQueries(['citizen-profile', user?.id]);
      setEditMode(false);
      setStatusMessage('✅ Profile updated successfully.');
      if (updated && login) {
        login({ ...user, ...updated });
      }
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || 'Failed to update profile. Please try again.';
      setStatusMessage(`❌ ${msg}`);
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    setStatusMessage('');
    updateProfile({
      name: formData.name?.trim() || '',
      email: formData.email?.trim()?.toLowerCase() || '',
    });
  };

  return (
    <DashboardLayout>
      <motion.div
        className="p-6 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Breadcrumb crumbs={[{ label: 'Citizen', to: '/citizen' }, { label: 'Profile' }]} />
        <motion.h1
          className="text-2xl font-bold"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          My Profile
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="transition-all duration-300 hover:shadow-xl"
        >
          <Card className="p-4">
            <CardHeader className="py-2">
              <CardTitle className="text-lg font-semibold">Account Details</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <motion.div
                  className="space-y-4 animate-pulse"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="h-4 w-16 bg-slate-200 rounded"></div>
                      <div className="h-10 w-full bg-slate-200 rounded-lg"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-16 bg-slate-200 rounded"></div>
                      <div className="h-10 w-full bg-slate-200 rounded-lg"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-16 bg-slate-200 rounded"></div>
                      <div className="h-6 w-32 bg-slate-200 rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-slate-200 rounded"></div>
                      <div className="h-6 w-40 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <div className="h-10 w-32 bg-slate-200 rounded-lg"></div>
                  </div>
                </motion.div>
              ) : isError ? (
                <motion.div
                  className="rounded-lg bg-red-50 border border-red-200 p-4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-red-700 font-medium">Unable to load profile</p>
                  <p className="text-red-600 text-sm">Please try refreshing the page or contact support.</p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35, duration: 0.3 }}
                    >
                      <label className="text-sm text-slate-500 block">Name</label>
                      <motion.input
                        value={formData?.name ?? ''}
                        disabled={!editMode || isSaving}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e?.target?.value ?? '' }))}
                        className={`mt-1 w-full rounded-lg border px-3 py-2 text-base transition-all duration-200 ${
                          editMode && !isSaving
                            ? 'border-blue-400 bg-white cursor-text'
                            : 'border-slate-300 bg-slate-50 cursor-not-allowed opacity-60'
                        }`}
                        required
                        whileFocus={editMode && !isSaving ? { scale: 1.02 } : {}}
                      />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.3 }}
                    >
                      <label className="text-sm text-slate-500 block">Email</label>
                      <motion.input
                        value={formData?.email ?? ''}
                        disabled={!editMode || isSaving}
                        onChange={(e) => setFormData((prev) => ({ ...prev, email: e?.target?.value ?? '' }))}
                        className={`mt-1 w-full rounded-lg border px-3 py-2 text-base transition-all duration-200 ${
                          editMode && !isSaving
                            ? 'border-blue-400 bg-white cursor-text'
                            : 'border-slate-300 bg-slate-50 cursor-not-allowed opacity-60'
                        }`}
                        type="email"
                        required
                        whileFocus={editMode && !isSaving ? { scale: 1.02 } : {}}
                      />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.45, duration: 0.3 }}
                    >
                      <p className="text-sm text-slate-500">Role</p>
                      <p className="text-lg font-semibold text-slate-800">{profile?.role ?? user?.role ?? '-'}</p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.3 }}
                    >
                      <p className="text-sm text-slate-500">Registered At</p>
                      <p className="text-lg font-semibold text-slate-800">
                        {profile?.createdAt ? new Date(profile?.createdAt).toLocaleString() : '-'}
                      </p>
                    </motion.div>
                  </div>

                  <motion.div
                    className="mt-6 flex items-center gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55, duration: 0.3 }}
                  >
                    {editMode ? (
                      <form onSubmit={handleSubmit} className="flex items-center gap-3">
                        <motion.button
                          type="submit"
                          disabled={isSaving}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(0,0,0,0.15)' }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {isSaving ? '⏳ Saving...' : '✅ Save Changes'}
                        </motion.button>
                        <motion.button
                          type="button"
                          onClick={() => {
                            setEditMode(false);
                            setStatusMessage('Edit canceled.');
                          }}
                          disabled={isSaving}
                          className="px-4 py-2 bg-slate-400 text-white rounded-lg font-medium hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(0,0,0,0.15)' }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Cancel
                        </motion.button>
                      </form>
                    ) : (
                      <motion.button
                        type="button"
                        onClick={() => {
                          setEditMode(true);
                          setStatusMessage('');
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
                        whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(0,0,0,0.15)' }}
                        whileTap={{ scale: 0.95 }}
                      >
                        ✏️ Edit Profile
                      </motion.button>
                    )}
                  </motion.div>

                  {statusMessage && (
                    <motion.p
                      className={`mt-3 text-sm font-medium ${
                        statusMessage.includes('✅')
                          ? 'text-green-700'
                          : statusMessage.includes('❌')
                            ? 'text-red-700'
                            : 'text-slate-700'
                      }`}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {statusMessage}
                    </motion.p>
                  )}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
