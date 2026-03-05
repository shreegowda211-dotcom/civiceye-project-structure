import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, ArrowRight } from 'lucide-react';

/**
 * @param {{ issue: Object, showActions?: boolean, onViewDetails?: () => void }} props
 */
export function IssueCard({ issue, showActions = true, onViewDetails }) {
  // Format date if it exists
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <Card className="shadow-card transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded font-mono">
                {issue.issueId || `#${issue._id?.slice(-6) || 'N/A'}`}
              </span>
              <StatusBadge status={issue.status || 'Pending'} />
              <PriorityBadge priority={issue.priority || 'Low'} />
            </div>
            <h3 className="font-semibold text-slate-900 line-clamp-2">{issue.title}</h3>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-slate-600 line-clamp-2">{issue.description}</p>

        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span className="truncate max-w-[200px]">{issue.location || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(issue.createdAt)}</span>
          </div>
        </div>

        {issue.category && (
          <div className="pt-2">
            <span className="inline-block bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-medium">
              {issue.category}
            </span>
          </div>
        )}

        {showActions && (
          <div className="flex gap-2 pt-3 border-t border-slate-200">
            {onViewDetails && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onViewDetails}
                className="gap-1"
              >
                View Details
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
