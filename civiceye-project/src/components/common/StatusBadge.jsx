import React from 'react';

// simple badge component that colors itself based on status
export function StatusBadge({ status }) {
  let bg = 'bg-gray-200 text-gray-800';
  switch (status) {
    case 'resolved':
      bg = 'bg-green-100 text-green-800';
      break;
    case 'in-progress':
      bg = 'bg-yellow-100 text-yellow-800';
      break;
    case 'pending':
    case 'reported':
      bg = 'bg-red-100 text-red-800';
      break;
    default:
      bg = 'bg-gray-100 text-gray-800';
  }
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${bg}`}>
      {status}
    </span>
  );
}
