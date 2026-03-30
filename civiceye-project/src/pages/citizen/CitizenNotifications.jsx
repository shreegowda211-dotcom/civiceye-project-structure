import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { citizenAPI } from '@/services/api';
import {
  Bell,
  AlertCircle,
  CheckCircle2,
  Clock,
  Trash2,
  Check,
} from 'lucide-react';
import Breadcrumb from '@/components/common/Breadcrumb';

// Workaround for eslint `no-unused-vars` false-positive with `<motion.div>` JSX usage.
const _motion = motion;

// Format backend createdAt into user-friendly relative time.
const formatTime = (dateInput) => {
  if (!dateInput) return 'Just now';
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return 'Just now';

  const now = new Date();
  const diffInMs = now - date;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;

  return date.toLocaleDateString();
};

const extractIssueIdFromLink = (link) => {
  if (!link || typeof link !== 'string') return null;
  const parts = link.split('/').filter(Boolean);
  return parts.length ? parts[parts.length - 1] : null;
};

// Notification Type Icons and Colors
const notificationConfig = {
  assignment: {
    icon: Bell,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700',
    label: 'New Assignment',
  },
  status_update: {
    icon: Clock,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700',
    label: 'Status Update',
  },
  resolved: {
    icon: CheckCircle2,
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    iconColor: 'text-emerald-600',
    badge: 'bg-emerald-100 text-emerald-700',
    label: 'Resolved',
  },
  escalation: {
    icon: AlertCircle,
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    iconColor: 'text-orange-600',
    badge: 'bg-orange-100 text-orange-700',
    label: 'Escalated',
  },
  system: {
    icon: AlertCircle,
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    iconColor: 'text-slate-600',
    badge: 'bg-slate-100 text-slate-700',
    label: 'System Alert',
  },
  feedback: {
    icon: Bell,
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    iconColor: 'text-purple-600',
    badge: 'bg-purple-100 text-purple-700',
    label: 'Feedback',
  },
  alert: {
    icon: AlertCircle,
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    iconColor: 'text-orange-600',
    badge: 'bg-orange-100 text-orange-700',
    label: 'Alert',
  },
};

export default function CitizenNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const readCount = notifications.filter((n) => n.isRead).length;

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await citizenAPI.getNotifications();
      if (!response?.data?.success) {
        setError(response?.data?.message || 'Failed to fetch notifications');
        return;
      }

      const data = response.data.data || [];
      const formattedNotifications = data.map((notif) => ({
        id: notif._id,
        title: notif.message,
        type: notif.type,
        isRead: notif.isRead,
        time: formatTime(notif.createdAt),
        link: notif.link,
      }));

      setNotifications(formattedNotifications);
    } catch (err) {
      console.error('Error fetching citizen notifications:', err);
      setError('Failed to load notifications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    // Optimistic update
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif)));
    try {
      await citizenAPI.markNotificationRead(id);
    } catch (err) {
      // If backend fails, refetch to avoid inconsistent UI
      console.error('Error marking notification read:', err);
      fetchNotifications();
    }
  };

  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.isRead).map((n) => n.id);
    if (!unread.length) return;

    // Optimistic update
    setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));

    try {
      await Promise.allSettled(unread.map((id) => citizenAPI.markNotificationRead(id)));
    } catch (err) {
      console.error('Error marking all notifications read:', err);
      fetchNotifications();
    }
  };

  const handleDelete = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const handleDeleteAllRead = () => {
    setNotifications((prev) => prev.filter((notif) => !notif.isRead));
  };

  const toggleExpandNot = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-6xl">
        <Breadcrumb crumbs={[{ label: 'Citizen', to: '/citizen' }, { label: 'Notifications' }]} />

        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
            <p className="text-slate-600 mt-1">Stay updated on your complaints and requests</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <p className="text-sm font-semibold text-blue-900">Unread: {unreadCount}</p>
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 font-semibold">{error}</p>
          </div>
        ) : null}

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap">
          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all"
            >
              <Check className="h-4 w-4" />
              Mark All as Read
            </Button>
          )}

          {readCount > 0 && (
            <Button
              onClick={handleDeleteAllRead}
              className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium transition-all border border-red-200"
            >
              <Trash2 className="h-4 w-4" />
              Clear Read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 bg-slate-50 rounded-lg"
            >
              <p className="text-slate-600 text-lg font-medium">Loading notifications...</p>
            </motion.div>
          ) : notifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 bg-slate-50 rounded-lg"
            >
              <Bell className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 text-lg font-medium">No notifications</p>
              <p className="text-slate-500 text-sm">You're all caught up!</p>
            </motion.div>
          ) : (
            notifications.map((notif, index) => {
              const config = notificationConfig[notif.type] || notificationConfig.system;
              const Icon = config.icon;
              const isExpanded = expandedId === notif.id;

              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`border-2 rounded-lg overflow-hidden transition-all cursor-pointer ${
                    config.borderColor
                  } ${config.bgColor} ${isExpanded ? 'ring-2 ring-offset-2 ring-blue-400' : ''}`}
                >
                  <div
                    onClick={() => toggleExpandNot(notif.id)}
                    className="p-4 flex items-start gap-4 hover:bg-black/[0.02] transition-colors"
                  >
                    {/* Icon */}
                    <div className={`p-2 rounded-lg flex-shrink-0 ${config.badge}`}>
                      <Icon className={`h-5 w-5 ${config.iconColor}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-900">{config.label}</h3>
                            {!notif.isRead && (
                              <motion.span
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="h-2 w-2 bg-green-500 rounded-full"
                              />
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                            {notif.title}
                          </p>
                          <div className="flex gap-3 mt-2 text-xs text-slate-500">
                            <span>Issue: {extractIssueIdFromLink(notif.link) || '-'}</span>
                            <span>•</span>
                            <span>{notif.time}</span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`text-xs font-bold whitespace-nowrap px-2 py-1 rounded ${
                            notif.isRead
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-green-200 text-green-800'
                          }`}
                        >
                          {notif.isRead ? 'Read' : 'New'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Actions */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t-2 border-current border-opacity-20 bg-black/[0.02] p-4 flex gap-2 flex-wrap"
                    >
                      {!notif.isRead && (
                        <Button
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-all"
                        >
                          <Check className="h-4 w-4" />
                          Mark as Read
                        </Button>
                      )}
                      <Button
                        onClick={() => handleDelete(notif.id)}
                        className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1 rounded text-sm font-medium transition-all border border-red-200"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>

        {/* Footer Stats */}
        {notifications.length > 0 && (
          <Card className="bg-slate-50 border border-slate-200 p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-slate-900">{notifications.length}</p>
                <p className="text-sm text-slate-600">Total</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{unreadCount}</p>
                <p className="text-sm text-slate-600">Unread</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-600">{readCount}</p>
                <p className="text-sm text-slate-600">Read</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
