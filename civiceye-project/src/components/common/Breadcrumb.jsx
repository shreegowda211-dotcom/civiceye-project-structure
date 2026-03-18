import React from 'react';
import { Link } from 'react-router-dom';

export default function Breadcrumb({ crumbs = [] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm">
      <ol className="flex items-center gap-1 text-slate-600">
        {crumbs.map((crumb, index) => (
          <li key={`${crumb.label}-${index}`} className="flex items-center gap-1">
            {index > 0 && <span aria-hidden="true">/</span>}
            {crumb.to ? (
              <Link to={crumb.to} className="text-indigo-600 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300">
                {crumb.label}
              </Link>
            ) : (
              <span className="font-semibold text-slate-900">{crumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
