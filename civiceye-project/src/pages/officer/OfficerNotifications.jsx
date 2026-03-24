import React, { useState } from 'react';
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
} from 'lucide-react';
import Breadcrumb from '@/components/common/Breadcrumb';

// Notification Type Icons and Colors
const notificationConfig = {
  assigned: {
    icon: Bell,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700',
    label: 'New Assignment',
  },
  updated: {
    icon: CheckCircle2,
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    iconColor: 'text-emerald-600',
    badge: 'bg-emerald-100 text-emerald-700',
    label: 'Update',
  },
  escalated: {
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

// Static notification data
const DUMMY_NOTIFICATIONS = [
  {
    id: 1,
    type: 'assigned',
    title: 'New Complaint Assigned',
    message: 'A new pothole complaint has been assigned to you in Bandra West.',
    issueId: 'ISS26001',
    time: '2 hours ago',
    isRead: false,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 2,
    type: 'updated',
    title: 'Complaint Status Updated',
    message: 'Your complaint ISS26098 status has been updated to "In Progress".',
    issueId: 'ISS26098',
    time: '5 hours ago',
    isRead: false,
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
  {
    id: 3,
    type: 'escalated',
    title: 'Complaint Escalated',
    message: 'A critical issue regarding water leakage has been escalated to admin.',
    issueId: 'ISS26087',
    time: '1 day ago',
    isRead: true,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: 4,
    type: 'system',
    title: 'System Maintenance',
    message: 'The system will undergo maintenance on Sunday 12:00 AM - 2:00 AM IST.',
    issueId: null,
    time: '1 day ago',
    isRead: true,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: 5,
    type: 'assigned',
    title: 'New Complaint Assigned',
    message: 'A garbage disposal complaint has been assigned in Dadar East.',
    issueId: 'ISS26105',
    time: '2 days ago',
    isRead: true,
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
  },
  {
    id: 6,
    type: 'updated',
    title: 'Complaint Resolved',
    message: 'Your complaint ISS26045 has been marked as "Resolved". Great work!',
    issueId: 'ISS26045',
    time: '3 days ago',
    isRead: true,
    timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000),
  },
  {
    id: 7,
    type: 'escalated',
    title: 'Multiple Complaints Escalated',
    message: 'You have 3 complaints pending action for more than 5 days.',
    issueId: null,
    time: '3 days ago',
    isRead: true,
    timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000),
  },
  {
    id: 8,
    type: 'assigned',
    title: 'New Complaint Assigned',
    message: 'A streetlight issue has been assigned in Fort area.',
    issueId: 'ISS26110',
    time: '4 days ago',
    isRead: true,
    timestamp: new Date(Date.now() - 96 * 60 * 60 * 1000),
  },
];

export default function OfficerNotifications() {
  const [notifications, setNotifications] = useState(DUMMY_NOTIFICATIONS);
  const [expandedId, setExpandedId] = useState(null);

  // Mark single notification as read
  const handleMarkAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  // Mark all as read
  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, isRead: true }))
    );
  };

  // Delete notification
  const handleDeleteNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  // Delete all read notifications
  const handleDeleteAllRead = () => {
    setNotifications((prev) => prev.filter((notif) => !notif.isRead));
  };

  // Get unread count
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Empty state
  if (notifications.length === 0) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Breadcrumb */}
            <Breadcrumb
              items={[
                { label: 'Dashboard', href: '/officer/dashboard' },
                { label: 'Notifications', current: true },
              ]}
            />

            {/* Header */}
            <motion.header
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 mt-6"
            >
              <h1 className="text-4xl font-bold text-white mb-2">Notifications</h1>
              <p className="text-slate-400">Stay updated with complaint activities</p>
            </motion.header>

            {/* Empty State */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <Bell className="h-16 w-16 text-slate-500 mb-4" />
              <h2 className="text-2xl font-semibold text-white mb-2">No notifications yet</h2>
              <p className="text-slate-400">You're all caught up! Check back later.</p>
            </motion.div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { label: 'Dashboard', href: '/officer/dashboard' },
              { label: 'Notifications', current: true },
            ]}
          />

          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 mt-6 flex items-start justify-between"
          >
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Notifications</h1>
              <p className="text-slate-400">Stay updated with complaint activities</p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="px-3 py-1 bg-red-500/20 border border-red-400/30 rounded-full text-red-300 text-xs font-semibold"
                >
                  {unreadCount} New
                </motion.span>
              )}
            </div>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex gap-2 mb-6"
          >
            {unreadCount > 0 && (
              <Button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all"
              >
                <Check className="h-4 w-4" />
                Mark All as Read
              </Button>
            )}

            {notifications.some((n) => n.isRead) && (
              <Button
                onClick={handleDeleteAllRead}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium transition-all"
              >
                <Trash2 className="h-4 w-4" />
                Clear Read
              </Button>
            )}
          </motion.div>

          {/* Notifications List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            {notifications.map((notification, index) => {
              const config = notificationConfig[notification.type];
              const Icon = config.icon;
              const isExpanded = expandedId === notification.id;

              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`border-2 rounded-lg transition-all duration-300 ${
                    notification.isRead
                      ? `${config.bgColor} ${config.borderColor}`
                      : `bg-white border-emerald-400 shadow-lg shadow-emerald-500/10`
                  }`}
                >
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : notification.id)}
                    className="p-4 cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className={`flex-shrink-0 p-2 rounded-lg ${
                          notification.isRead ? config.badge : 'bg-emerald-100'
                        }`}
                      >
                        <Icon
                          className={`h-6 w-6 ${
                            notification.isRead ? config.iconColor : 'text-emerald-600'
                          }`}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-slate-900">
                                {notification.title}
                              </h3>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.badge}`}>
                                {config.label}
                              </span>
                              {!notification.isRead && (
                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                              )}
                            </div>
                            <p className="text-slate-600 text-sm line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {notification.time}
                              </span>
                              {notification.issueId && (
                                <span className="text-xs font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                                  {notification.issueId}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Status Indicator */}
                          <div className="flex items-center gap-2">
                            {!notification.isRead && (
                              <span className="h-3 w-3 rounded-full bg-emerald-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Actions */}
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-slate-200 flex gap-2"
                      >
                        {!notification.isRead && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded font-medium text-sm transition-all"
                          >
                            Mark as Read
                          </Button>
                        )}
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(notification.id);
                          }}
                          className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-600 px-3 py-2 rounded font-medium text-sm transition-all border border-red-400/30"
                        >
                          Delete
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Stats Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 p-4 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm"
          >
            <div className="flex justify-between text-sm text-slate-400">
              <div>
                <span className="font-semibold text-white">{notifications.length}</span> total
                notifications
              </div>
              <div>
                <span className="font-semibold text-emerald-400">{unreadCount}</span> unread
              </div>
              <div>
                <span className="font-semibold text-slate-300">
                  {notifications.filter((n) => n.isRead).length}
                </span>{' '}
                read
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
