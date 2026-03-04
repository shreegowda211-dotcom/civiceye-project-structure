import React from 'react';

export function PriorityBadge({ priority }) {
  let bg = 'bg-gray-200 text-gray-800';
  switch (priority) {
    case 'low':
      bg = 'bg-blue-100 text-blue-800';
      break;
    case 'medium':
      bg = 'bg-yellow-100 text-yellow-800';
      break;
    case 'high':
      bg = 'bg-red-100 text-red-800';
      break;
    default:
      bg = 'bg-gray-100 text-gray-800';
  }
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${bg}`}>
      {priority}
    </span>
  );
}
