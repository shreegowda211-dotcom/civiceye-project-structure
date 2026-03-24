import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Activity,
  Award,
  Zap,
  RotateCcw,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { officerAPI } from '../../services/api';

// ======================================
// SKELETON LOADER COMPONENTS
// ======================================

const SkeletonCard = () => (
  <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-3 bg-slate-700 rounded mb-3 w-24 animate-pulse"></div>
          <div className="h-8 bg-slate-700 rounded mb-2 w-16 animate-pulse"></div>
          <div className="h-2 bg-slate-700 rounded w-32 animate-pulse"></div>
        </div>
        <div className="w-14 h-14 bg-slate-700 rounded-lg animate-pulse"></div>
      </div>
    </CardContent>
  </Card>
);

const SkeletonChart = () => (
  <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
    <CardHeader>
      <div className="h-5 bg-slate-700 rounded w-40 animate-pulse"></div>
    </CardHeader>
    <CardContent className="p-6">
      <div className="h-64 bg-slate-700/30 rounded animate-pulse"></div>
    </CardContent>
  </Card>
);

// ======================================
// ERROR STATE COMPONENT
// ======================================

const ErrorState = ({ onRetry }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      <Card className="bg-red-500/10 border border-red-500/30 shadow-xl">
        <CardContent className="p-8">
          <div className="flex items-center gap-4">
            <AlertCircle className="h-8 w-8 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-300 mb-2">
                Failed to Load Performance Data
              </h3>
              <p className="text-slate-400 mb-4">
                Unable to fetch your performance analytics. Please check your connection and try again.
              </p>
            </div>
            <button
              onClick={onRetry}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all"
            >
              <RotateCcw className="h-4 w-4" />
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

// ======================================
// MAIN COMPONENT
// ======================================

export default function OfficerPerformance() {
  // Fetch performance data using React Query
  const {
    data: performanceData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['officerPerformance'],
    queryFn: () => officerAPI.getOfficerPerformance().then((res) => res.data),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  // Extract data with fallbacks
  const totalAssigned = performanceData?.totalAssigned || 0;
  const resolved = performanceData?.resolved || 0;
  const pending = performanceData?.pending || 0;
  const inProgress = performanceData?.inProgress || 0;
  const avgResolutionTime = performanceData?.avgResolutionTime || 0;
  const monthlyData = performanceData?.monthlyData || [];
  const recentActivities = performanceData?.recentActivities || [];

  // Calculate status distribution from API data
  const statusDistributionData = [
    { name: '⏳ Pending', value: pending, color: '#EAB308' },
    { name: '⚙️ In Progress', value: inProgress, color: '#3B82F6' },
    { name: '✅ Resolved', value: resolved, color: '#10B981' },
  ].filter((item) => item.value > 0);

  // Show error state
  if (isError) {
    return (
      <DashboardLayout>
        <ErrorState onRetry={() => refetch()} />
      </DashboardLayout>
    );
  }

  // Summary card component
  const SummaryCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl hover:shadow-2xl transition-all">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-slate-400 text-sm font-semibold uppercase mb-2">{title}</p>
            <h3 className="text-4xl font-bold text-white mb-2">{value}</h3>
            <p className="text-slate-500 text-xs">{subtitle}</p>
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">My Performance</h1>
            <p className="text-slate-400">Track your complaint handling performance</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {isLoading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <>
                <SummaryCard
                  icon={TrendingUp}
                  title="Total Assigned"
                  value={totalAssigned}
                  subtitle="All time complaints"
                  color="bg-blue-600/30"
                />
                <SummaryCard
                  icon={CheckCircle2}
                  title="Resolved"
                  value={resolved}
                  subtitle="Successfully closed"
                  color="bg-green-600/30"
                />
                <SummaryCard
                  icon={Clock}
                  title="Pending"
                  value={pending}
                  subtitle="Awaiting action"
                  color="bg-yellow-600/30"
                />
                <SummaryCard
                  icon={Award}
                  title="Avg. Time"
                  value={`${avgResolutionTime}d`}
                  subtitle="Days to resolve"
                  color="bg-purple-600/30"
                />
              </>
            )}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Monthly Performance Chart */}
            <div className="lg:col-span-2">
              {isLoading ? (
                <SkeletonChart />
              ) : (
                <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-white">Monthly Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {monthlyData && monthlyData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                          <YAxis stroke="rgba(255,255,255,0.5)" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(15, 23, 42, 0.9)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              borderRadius: '8px',
                            }}
                            labelStyle={{ color: '#fff' }}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="count"
                            stroke="#3B82F6"
                            dot={{ fill: '#3B82F6', r: 5 }}
                            activeDot={{ r: 7 }}
                            strokeWidth={2}
                            name="Complaints Handled"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-64 flex items-center justify-center text-slate-400">
                        No data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Status Distribution Chart */}
            <div>
              {isLoading ? (
                <SkeletonChart />
              ) : (
                <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-white">Status Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {statusDistributionData && statusDistributionData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={statusDistributionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry) => `${entry.name}: ${entry.value}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {statusDistributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(15, 23, 42, 0.9)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              borderRadius: '8px',
                              color: '#fff',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-64 flex items-center justify-center text-slate-400">
                        No data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Resolution Speed Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Resolution Speed */}
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Resolution Speed
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div>
                  <p className="text-slate-400 text-sm mb-2">Average time to resolve complaints</p>
                  <h3 className="text-3xl font-bold text-white mb-4">
                    {isLoading ? (
                      <div className="h-8 bg-slate-700 rounded w-24 animate-pulse"></div>
                    ) : (
                      `${avgResolutionTime || 0} Days`
                    )}
                  </h3>

                  {/* Progress Bars */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-slate-300 text-sm">This Month</p>
                        <div className="text-white font-semibold">
                          {isLoading ? (
                            <div className="h-4 bg-slate-700 rounded w-16 animate-pulse"></div>
                          ) : (
                            `${performanceData?.thisMonthAvg || 0} days`
                          )}
                        </div>
                      </div>
                      <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-300"
                          style={{
                            width: isLoading
                              ? '0%'
                              : `${
                                  ((performanceData?.thisMonthAvg || 0) /
                                    (performanceData?.avgResolutionTime || 3)) *
                                  100
                                }%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-slate-300 text-sm">Last Month</p>
                        <div className="text-white font-semibold">
                          {isLoading ? (
                            <div className="h-4 bg-slate-700 rounded w-16 animate-pulse"></div>
                          ) : (
                            `${performanceData?.lastMonthAvg || 0} days`
                          )}
                        </div>
                      </div>
                      <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-300"
                          style={{
                            width: isLoading
                              ? '0%'
                              : `${
                                  ((performanceData?.lastMonthAvg || 0) /
                                    (performanceData?.avgResolutionTime || 3)) *
                                  100
                                }%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-slate-300 text-sm">Target</p>
                        <div className="text-white font-semibold">3 days</div>
                      </div>
                      <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                  <div>
                    <p className="text-slate-400 text-xs uppercase mb-1">Fastest Resolution</p>
                    <div className="text-white font-bold">
                      {isLoading ? (
                        <div className="h-4 bg-slate-700 rounded w-12 animate-pulse"></div>
                      ) : (
                        `${performanceData?.fastestResolution || '0'} hours`
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs uppercase mb-1">Slowest Resolution</p>
                    <div className="text-white font-bold">
                      {isLoading ? (
                        <div className="h-4 bg-slate-700 rounded w-12 animate-pulse"></div>
                      ) : (
                        `${performanceData?.slowestResolution || '0'} days`
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Highlights */}
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  Performance Highlights
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {isLoading ? (
                    <>
                      <div className="bg-slate-700/30 rounded-lg p-4 h-20 animate-pulse"></div>
                      <div className="bg-slate-700/30 rounded-lg p-4 h-20 animate-pulse"></div>
                      <div className="bg-slate-700/30 rounded-lg p-4 h-20 animate-pulse"></div>
                    </>
                  ) : (
                    <>
                      {/* Highlight 1 */}
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-green-300 font-semibold text-sm">Excellent Performance</p>
                            <p className="text-slate-400 text-xs mt-1">
                              You've resolved {Math.round(((resolved || 0) / (totalAssigned || 1)) * 100)}% of all complaints assigned
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Highlight 2 */}
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <TrendingUp className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-blue-300 font-semibold text-sm">Improvement Trend</p>
                            <p className="text-slate-400 text-xs mt-1">
                              {performanceData?.improvementPercentage
                                ? `Your average resolution time improved by ${performanceData.improvementPercentage}% this month`
                                : 'Keep up the good work!'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Highlight 3 */}
                      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Award className="h-5 w-5 text-purple-500 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-purple-300 font-semibold text-sm">Top Performer</p>
                            <p className="text-slate-400 text-xs mt-1">
                              {performanceData?.performanceRank
                                ? `You're in top ${performanceData.performanceRank}% among all officers`
                                : 'Continue delivering great results!'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Section */}
          <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {isLoading ? (
                  <>
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-start gap-4 pb-4 border-b border-slate-700/50">
                        <div className="w-5 h-5 bg-slate-700 rounded-full animate-pulse flex-shrink-0 mt-1"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-slate-700 rounded w-48 animate-pulse mb-2"></div>
                          <div className="h-3 bg-slate-700 rounded w-64 animate-pulse mb-2"></div>
                          <div className="h-3 bg-slate-700 rounded w-24 animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : recentActivities && recentActivities.length > 0 ? (
                  recentActivities.map((activity) => {
                    const IconComponent =
                      activity.action?.toLowerCase().includes('resolved') ||
                      activity.action?.toLowerCase().includes('closed')
                        ? CheckCircle2
                        : activity.action?.toLowerCase().includes('progress')
                          ? Clock
                          : AlertCircle;
                    const colors = {
                      resolved: 'text-green-500',
                      progress: 'text-blue-500',
                      assigned: 'text-yellow-500',
                    };
                    const color =
                      activity.action?.toLowerCase().includes('resolved') ||
                      activity.action?.toLowerCase().includes('closed')
                        ? colors.resolved
                        : activity.action?.toLowerCase().includes('progress')
                          ? colors.progress
                          : colors.assigned;

                    return (
                      <div
                        key={activity.id || activity._id}
                        className="flex items-start gap-4 pb-4 border-b border-slate-700/50 last:border-b-0 last:pb-0"
                      >
                        <div className={`mt-1 flex-shrink-0 ${color}`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm">{activity.action}</p>
                          <p className="text-slate-400 text-sm mt-1 truncate">{activity.description || activity.issue}</p>
                          <p className="text-slate-500 text-xs mt-2">{activity.time || activity.timestamp}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-slate-400">No recent activities</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
