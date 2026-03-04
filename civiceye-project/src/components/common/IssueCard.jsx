import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, ArrowRight } from 'lucide-react';
import format from 'date-fns/format';
import { Link } from 'react-router-dom';

// mapping internal category identifiers to readable labels
const categoryLabels = {
  'road-damage': 'Road Damage',
  garbage: 'Garbage',
  streetlight: 'Streetlight',
  'water-leakage': 'Water Leakage',
  other: 'Other',
};

/**
 * @param {{ issue: Issue, showActions?: boolean, onViewDetails?: () => void }} props
 */
export function IssueCard({ issue, showActions = true, onViewDetails }) {
  return (
    <Card className="shadow-card transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">{issue.id}</span>
              <StatusBadge status={issue.status} />
              <PriorityBadge priority={issue.priority} />
            </div>
            <h3 className="font-heading font-semibold leading-tight">{issue.title}</h3>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{issue.description}</p>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span className="truncate max-w-[200px]">{issue.location.address}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(issue.reportedAt), 'MMM d, yyyy')}</span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t pt-3">
          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
            {categoryLabels[issue.category]}
          </span>
          {showActions && (
            <Link to={`/citizen/track/${issue.id}`}>
              <Button variant="ghost" size="sm" className="gap-1">
                View Details
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
