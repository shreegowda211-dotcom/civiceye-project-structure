import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Bell,
  AlertCircle,
  CheckCircle2,
  ArrowUpCircle,
  Clock,
  Trash2,
  Check,
  RefreshCw,
  Loader,
} from 'lucide-react';
import Breadcrumb from '@/components/common/Breadcrumb';
import { officerAPI } from '@/services/api';

// Alias motion.div so ESLint counts it as a used identifier
const MotionDiv = motion.div;

// Time formatting utility
const formatTime = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMs = now - date;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;

  return date.toLocaleDateString();
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
  // Backward compatibility for older saved documents
  update: {
    icon: Clock,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700',
    label: 'Status Update',
  },
  escalation: {
    icon: ArrowUpCircle,
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
};

export default function OfficerNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await officerAPI.getNotifications();
      if (response.data.success) {
        setNotifications(response.data.notifications || []);
      } else {
        setError('Failed to fetch notifications');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh notifications when returning to this tab/window.
  useEffect(() => {
    const maybeRefresh = () => {
      if (document.visibilityState === 'visible') {
        fetchNotifications();
      }
    };

    window.addEventListener('focus', maybeRefresh);
    document.addEventListener('visibilitychange', maybeRefresh);

    return () => {
      window.removeEventListener('focus', maybeRefresh);
      document.removeEventListener('visibilitychange', maybeRefresh);
    };
  }, []);

  // Get unread count
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const readCount = notifications.filter((n) => n.isRead).length;

  // Handle mark as read
  const handleMarkAsRead = async (id) => {
    try {
      await officerAPI.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((notif) => (notif._id === id ? { ...notif, isRead: true } : notif))
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
      // Still update UI optimistically
      setNotifications((prev) =>
        prev.map((notif) => (notif._id === id ? { ...notif, isRead: true } : notif))
      );
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await officerAPI.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      // Still update UI optimistically
      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
    }
  };

  // Toggle expand
  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-6xl">
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/officer/dashboard' },
            { label: 'Notifications', current: true },
          ]}
        />

        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
            <p className="text-slate-600 mt-1">Stay updated with complaint activities</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <p className="text-sm font-semibold text-blue-900">Unread: {unreadCount}</p>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <Loader className="h-6 w-6 animate-spin text-blue-600" />
              <p className="text-slate-600">Loading notifications...</p>
            </div>
          </div>

        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-700">{error}</p>
            </div>
            <Button
              onClick={fetchNotifications}
              className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Action Buttons */}
        {!isLoading && !error && (
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

          <Button
            onClick={fetchNotifications}
            className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        )}

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No notifications yet</h3>
              <p className="text-slate-600">You'll see notifications here when complaints are assigned to you or updated.</p>
            </div>
          ) : (
            notifications.map((notification, index) => {
              const config = notificationConfig[notification.type] || notificationConfig.system;
              const Icon = config.icon;
              const isExpanded = expandedId === notification._id;

              return (
                <MotionDiv
                  key={notification._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`border-2 rounded-lg transition-all duration-300 ${
                    notification.isRead
                      ? `${config.bgColor} ${config.borderColor}`
                      : `bg-white border-blue-400 shadow-lg shadow-blue-500/10`
                  }`}
                >
                  <div
                    onClick={() => toggleExpand(notification._id)}
                    className="p-4 cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className={`flex-shrink-0 p-2 rounded-lg ${
                          notification.isRead ? config.badge : 'bg-blue-100'
                        }`}
                      >
                        <Icon
                          className={`h-6 w-6 ${
                            notification.isRead ? config.iconColor : 'text-blue-600'
                          }`}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-slate-900">
                                {notification.type === 'assignment' ? 'New Assignment' :
                                 notification.type === 'status_update' ? 'Status Update' :
                                 notification.type === 'resolved' ? 'Complaint Resolved' :
                                 notification.type === 'update' ? 'Status Update' :
                                 notification.type === 'escalation' ? 'Escalated Complaint' :
                                 'System Notification'}
                              </h3>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.badge}`}>
                                {config.label}
                              </span>
                              {!notification.isRead && (
                                <span className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse" />
                              )}
                            </div>
                            <p className="text-slate-600 text-sm line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTime(notification.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Actions */}
                    {isExpanded && (
                      <MotionDiv
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-slate-200 flex gap-2"
                      >
                        {!notification.isRead && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification._id);
                            }}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded font-medium text-sm transition-all"
                          >
                            Mark as Read
                          </Button>
                        )}
                        {/* No delete/dismiss for real notifications */}
                      </MotionDiv>
                    )}
                  </div>
                </MotionDiv>
              );
            })
          )}
        </div>
        {/* Stats Footer */}
        <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex justify-between text-sm text-slate-600">
            <div>
              <span className="font-semibold text-slate-900">{notifications.length}</span> total
              notifications
            </div>
            <div>
              <span className="font-semibold text-blue-600">{unreadCount}</span> unread
            </div>
            <div>
              <span className="font-semibold text-slate-500">
                {readCount}
              </span>{' '}
              read
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
