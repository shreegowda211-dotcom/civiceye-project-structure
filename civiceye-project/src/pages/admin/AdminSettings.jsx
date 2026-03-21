import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const tabs = ['General', 'Security', 'Complaint Rules', 'Notifications'];

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('General');
  const [formData, setFormData] = useState({
    slaHours: 48,
    autoEscalationEnabled: true,
    escalationRules: [{ level: 1, thresholdHours: 24, action: 'Email admin' }],
    priorityLevels: [
      { name: 'Low', responseHours: 72 },
      { name: 'Medium', responseHours: 48 },
      { name: 'High', responseHours: 24 },
      { name: 'Critical', responseHours: 12 },
    ],
    securitySettings: {
      mfaEnabled: false,
      passwordMinLength: 8,
      passwordRequiresNumbers: true,
      passwordRequiresSpecial: true,
    },
    notificationSettings: {
      email: true,
      sms: false,
      push: true,
    },
  });

  const queryClient = useQueryClient();

  const token = localStorage.getItem('civiceye_token');
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      try {
        const res = await adminAPI.getSettings();
        return res.data?.data ?? {};
      } catch (error) {
        console.warn('adminAPI.getSettings failed', error?.message || error);
        return {};
      }
    },
    staleTime: 60_000,
    enabled: !!token,
    retry: 1,
  });

  useEffect(() => {
    if (data) {
      setFormData((prev) => ({
        ...prev,
        ...data,
        escalationRules: data.escalationRules || prev.escalationRules,
        priorityLevels: data.priorityLevels || prev.priorityLevels,
        securitySettings: { ...prev.securitySettings, ...(data.securitySettings || {}) },
        notificationSettings: { ...prev.notificationSettings, ...(data.notificationSettings || {}) },
      }));
    }
  }, [data]);

  const { mutate, isLoading: isSaving } = useMutation({
    mutationFn: (payload) => adminAPI.updateSettings(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['admin-settings']);
      setFormData((prev) => ({ ...prev, ...res.data.data }));
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    mutate(formData);
  };

  const statusMessage = useMemo(() => {
    if (isLoading) return 'Loading settings…';
    if (isError) return 'Unable to load settings. Please refresh or re-login.';
    if (!token) return 'No auth token found. Please login first.';
    return '';
  }, [isLoading, isError, token]);

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-94px)] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Admin Settings</h1>
              <p className="text-slate-300">Configure SLA, escalation rules, priorities, security and notification controls.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleSubmit} disabled={isSaving || isLoading}>
                {isSaving ? 'Saving...' : 'Save settings'}
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-4">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    activeTab === tab
                      ? 'bg-emerald-400/20 text-emerald-200 ring-1 ring-emerald-300'
                      : 'bg-slate-900/40 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {activeTab === 'General' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-slate-200">SLA response time (hours)</label>
                      <input
                        type="number"
                        min={1}
                        value={formData.slaHours}
                        onChange={(e) => setFormData({ ...formData, slaHours: Number(e.target.value) || 0 })}
                        className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-slate-200">Auto escalation enabled</label>
                      <select
                        value={formData.autoEscalationEnabled ? 'true' : 'false'}
                        onChange={(e) => setFormData({ ...formData, autoEscalationEnabled: e.target.value === 'true' })}
                        className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100"
                      >
                        <option value="true">Enabled</option>
                        <option value="false">Disabled</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-slate-200">Priority levels (response hours)</label>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      {formData.priorityLevels.map((item, i) => (
                        <div key={`${item.name}-${i}`} className="rounded-lg border border-slate-700 p-3 bg-slate-900/80">
                          <p className="mb-2 text-sm text-slate-300">{item.name}</p>
                          <input
                            type="number"
                            min={1}
                            value={item.responseHours}
                            onChange={(e) => {
                              const value = Number(e.target.value) || 0;
                              const next = formData.priorityLevels.map((level, idx) =>
                                idx === i ? { ...level, responseHours: value } : level
                              );
                              setFormData({ ...formData, priorityLevels: next });
                            }}
                            className="w-full rounded-md border border-slate-600 bg-slate-950 px-2 py-1 text-sm text-slate-100"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Security' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-slate-200">Enable MFA</label>
                    <select
                      value={formData.securitySettings.mfaEnabled ? 'true' : 'false'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          securitySettings: {
                            ...formData.securitySettings,
                            mfaEnabled: e.target.value === 'true',
                          },
                        })
                      }
                      className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100"
                    >
                      <option value="true">Enabled</option>
                      <option value="false">Disabled</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-slate-200">Password minimum length</label>
                    <input
                      type="number"
                      min={6}
                      value={formData.securitySettings.passwordMinLength}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          securitySettings: {
                            ...formData.securitySettings,
                            passwordMinLength: Number(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-slate-200">Require numbers in passwords</label>
                    <select
                      value={formData.securitySettings.passwordRequiresNumbers ? 'true' : 'false'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          securitySettings: {
                            ...formData.securitySettings,
                            passwordRequiresNumbers: e.target.value === 'true',
                          },
                        })
                      }
                      className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100"
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-slate-200">Require special characters</label>
                    <select
                      value={formData.securitySettings.passwordRequiresSpecial ? 'true' : 'false'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          securitySettings: {
                            ...formData.securitySettings,
                            passwordRequiresSpecial: e.target.value === 'true',
                          },
                        })
                      }
                      className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100"
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === 'Complaint Rules' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-slate-200">Auto escalation</label>
                    <select
                      value={formData.autoEscalationEnabled ? 'true' : 'false'}
                      onChange={(e) => setFormData({ ...formData, autoEscalationEnabled: e.target.value === 'true' })}
                      className="w-full max-w-xs rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100"
                    >
                      <option value="true">Enabled</option>
                      <option value="false">Disabled</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-slate-200">Escalation rules</p>
                    <div className="space-y-2">
                      {formData.escalationRules.map((rule, i) => (
                        <div key={`rule-${i}`} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <input
                            type="number"
                            min={1}
                            value={rule.thresholdHours}
                            onChange={(e) => {
                              const next = formData.escalationRules.map((r, idx) =>
                                idx === i ? { ...r, thresholdHours: Number(e.target.value) || 0 } : r
                              );
                              setFormData({ ...formData, escalationRules: next });
                            }}
                            className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100"
                            placeholder="Threshold hours"
                          />
                          <input
                            value={rule.action}
                            onChange={(e) => {
                              const next = formData.escalationRules.map((r, idx) =>
                                idx === i ? { ...r, action: e.target.value } : r
                              );
                              setFormData({ ...formData, escalationRules: next });
                            }}
                            className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100"
                            placeholder="Action"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const next = formData.escalationRules.filter((_, idx) => idx !== i);
                              setFormData({ ...formData, escalationRules: next });
                            }}
                            className="rounded-lg border border-red-500 px-3 py-2 text-sm text-red-300 hover:bg-red-500/20"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            escalationRules: [...formData.escalationRules, { level: formData.escalationRules.length + 1, thresholdHours: 24, action: 'Email admin' }],
                          })
                        }
                        className="rounded-lg border border-emerald-400 px-3 py-2 text-sm text-emerald-200 hover:bg-emerald-400/20"
                      >
                        Add escalation rule
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Notifications' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['email', 'sms', 'push'].map((item) => (
                    <div key={item} className="space-y-2">
                      <label className="text-sm text-slate-200 capitalize">{item} alerts</label>
                      <select
                        value={formData.notificationSettings[item] ? 'true' : 'false'}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            notificationSettings: {
                              ...formData.notificationSettings,
                              [item]: e.target.value === 'true',
                            },
                          })
                        }
                        className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100"
                      >
                        <option value="true">Enabled</option>
                        <option value="false">Disabled</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}

              {statusMessage && (
                <div className="rounded-lg bg-red-950/50 p-3 text-sm text-red-200">
                  <p>{statusMessage}</p>
                  {isError && (
                    <Button variant="outline" size="sm" onClick={refetch} className="mt-2">
                      Retry
                    </Button>
                  )}
                </div>
              )}

              <div className="pt-3">
                <Button type="submit" disabled={isSaving || isLoading || !!isError}>
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
