import React from 'react';

export function StatsCard({ title, value, icon, variant = 'default' }) {
  const bgVariant = {
    default: 'bg-white',
    warning: 'bg-yellow-50',
    success: 'bg-green-50',
  };

  return (
    <div className={`rounded-lg p-4 shadow-sm ${bgVariant[variant]}`}> 
      <div className="flex items-center gap-3">
        <div className="text-xl">{icon}</div>
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
