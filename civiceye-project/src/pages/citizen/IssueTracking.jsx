import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { useQuery } from '@tanstack/react-query';
import { citizenAPI } from '@/services/api';
import {
  MapPin,
  Calendar,
  User,
  ClipboardList,
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  ArrowLeft,
} from 'lucide-react';

export default function IssueTracking() {
  const { issueId: routeIssueId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchId, setSearchId] = useState(routeIssueId || '');
  const [displayId, setDisplayId] = useState(routeIssueId || '');

  // Fetch single complaint details
  const { data: complaint, isLoading, isError, error } = useQuery({
    queryKey: ['complaint', displayId],
    queryFn: async () => {
      if (!displayId) return null;
      const res = await citizenAPI.getComplaintById(displayId);
      return res.data.complaint;
    },
    enabled: !!displayId,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchId.trim()) {
      setDisplayId(searchId);
      navigate(`/citizen/track/${searchId}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved':
        return 'bg-green-100 text-green-900';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-900';
      case 'Pending':
        return 'bg-blue-100 text-blue-900';
      case 'Rejected':
        return 'bg-red-100 text-red-900';
      default:
        return 'bg-slate-100 text-slate-900';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Resolved':
        return <CheckCircle2 className="h-6 w-6 text-green-600" />;
      case 'In Progress':
        return <Clock className="h-6 w-6 text-yellow-600" />;
      case 'Pending':
        return <AlertCircle className="h-6 w-6 text-blue-600" />;
      case 'Rejected':
        return <AlertCircle className="h-6 w-6 text-red-600" />;
      default:
        return <ClipboardList className="h-6 w-6 text-slate-600" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Track Your Issue</h1>
            <p className="text-muted-foreground">
              Enter an issue ID to view its current status and updates
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate('/citizen')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Search Form */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Issue by ID
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="e.g., ISS26001, ISS26002..."
                title="Copy your issue ID (e.g., ISS26001)"
                className="flex-1 rounded border border-slate-300 px-4 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Search
              </Button>
            </form>
            <p className="text-xs text-slate-500 mt-2">
              💡 Your issue ID appears in the format: <span className="font-mono bg-slate-100 px-2 py-1 rounded">ISS26001</span>
            </p>
          </CardContent>
        </Card>

        {/* Issue Details */}
        {isLoading && (
          <Card className="shadow-card">
            <CardContent className="py-12">
              <div className="flex justify-center items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                <p className="text-slate-600">Loading issue details...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {isError && (
          <Card className="shadow-card border border-red-200 bg-red-50">
            <CardContent className="py-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-red-900">Error Loading Issue</p>
                  <p className="text-sm text-red-700 mt-1">
                    {error?.response?.data?.message || error?.message || 'Failed to load issue'}
                  </p>
                  <p className="text-xs text-red-600 mt-2">
                    💡 <strong>Troubleshooting:</strong>
                  </p>
                  <ul className="text-xs text-red-600 mt-1 space-y-1 ml-4 list-disc">
                    <li>Make sure you copied the full issue ID (e.g., ISS26001)</li>
                    <li>Check if you have permission to view this issue</li>
                    <li>Try searching from the "My Issues" page for accurate ID</li>
                  </ul>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/citizen/issues')}
                    className="mt-4"
                  >
                    Go to My Issues
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && complaint && (
          <div className="space-y-6">
            {/* Status Overview */}
            <Card className="shadow-card border-l-4 border-emerald-600">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded font-mono">
                        {complaint.issueId || `#${complaint._id?.slice(-6) || 'N/A'}`}
                      </span>
                      <StatusBadge status={complaint.status} />
                      <PriorityBadge priority={complaint.priority} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      {complaint.title}
                    </h2>
                  </div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100">
                    {getStatusIcon(complaint.status)}
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Issue Details Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Issue Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                      Description
                    </p>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {complaint.description}
                    </p>
                  </div>

                  <div className="border-t border-slate-200 pt-4 space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase">
                          Location
                        </p>
                        <p className="text-sm text-slate-700">
                          {complaint.location}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <ClipboardList className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase">
                          Category
                        </p>
                        <span className="inline-block bg-slate-100 text-slate-700 px-3 py-1 rounded text-xs font-medium mt-1">
                          {complaint.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase">
                          Priority Level
                        </p>
                        <div className="mt-1">
                          <PriorityBadge priority={complaint.priority} />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Status Timeline */}
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Status Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="h-4 w-4 rounded-full bg-emerald-600"></div>
                          <div className="h-8 w-0.5 bg-emerald-200 my-1"></div>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            Issue Created
                          </p>
                          <p className="text-sm text-slate-500">
                            {formatDate(complaint.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`h-4 w-4 rounded-full ${
                            complaint.status !== 'Pending'
                              ? 'bg-emerald-600'
                              : 'bg-slate-300'
                          }`}></div>
                          {complaint.status !== 'Resolved' && (
                            <div className="h-8 w-0.5 bg-slate-200 my-1"></div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            Under Review
                          </p>
                          <p className="text-sm text-slate-500">
                            {complaint.status !== 'Pending'
                              ? 'Status changed from Pending'
                              : 'Waiting for review'}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`h-4 w-4 rounded-full ${
                            complaint.status === 'Resolved'
                              ? 'bg-emerald-600'
                              : 'bg-slate-300'
                          }`}></div>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {complaint.status === 'Resolved'
                              ? 'Issue Resolved'
                              : 'Pending Resolution'}
                          </p>
                          <p className="text-sm text-slate-500">
                            {complaint.status === 'Resolved'
                              ? formatDate(complaint.updatedAt)
                              : 'In progress'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Assigned Officer */}
                {complaint.assignedOfficer ? (
                  <Card className="shadow-card bg-blue-50 border border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Assigned Officer
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-700">
                          {complaint.assignedOfficer.name}
                        </p>
                        <p className="text-sm text-slate-600">
                          {complaint.assignedOfficer.email}
                        </p>
                      </div>
                      <p className="text-xs text-slate-600 italic">
                        This officer is responsible for handling your complaint
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="shadow-card bg-yellow-50 border border-yellow-200">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5 text-yellow-600" />
                        Assigned Officer
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-700">
                        No officer assigned yet. Your complaint is under review.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Submission Info */}
            <Card className="shadow-card bg-slate-50">
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                      Submitted
                    </p>
                    <p className="text-slate-700">{formatDate(complaint.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                      Last Updated
                    </p>
                    <p className="text-slate-700">{formatDate(complaint.updatedAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!isLoading && !isError && !complaint && displayId && (
          <Card className="shadow-card border border-yellow-200 bg-yellow-50">
            <CardContent className="py-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-900 font-semibold">Issue Not Found</p>
                  <p className="text-sm text-slate-700 mt-1">
                    Could not find an issue with ID: <span className="font-mono font-bold bg-yellow-100 px-2 py-1 rounded">{displayId}</span>
                  </p>
                  <p className="text-xs text-slate-600 mt-2">
                    ✓ Make sure you copied the <strong>full issue ID</strong> correctly<br/>
                    ✓ The ID is typically a long code (e.g., 507f1f77bcf86cd799439011)
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/citizen/issues')}
                    className="mt-4"
                  >
                    Go to My Issues
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
