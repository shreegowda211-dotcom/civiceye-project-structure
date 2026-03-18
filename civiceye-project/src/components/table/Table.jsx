import React from 'react';

export function Table({ columns, data, renderRow, emptyMessage = 'No data found', isLoading = false }) {
  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left font-semibold text-slate-700">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-8 text-slate-400">Loading...</td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-8 text-slate-400">{emptyMessage}</td>
            </tr>
          ) : (
            data.map((row, idx) => renderRow(row, idx))
          )}
        </tbody>
      </table>
    </div>
  );
}
