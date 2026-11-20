import React from 'react';
import { Modal } from '../common/Modal';
import { Database, Clock, Hash } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const ViewDataModal = ({ isOpen, onClose, viewResult, isLoading }) => {
  if (!isOpen) return null;

  const rows = viewResult?.rows || [];
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Live MySQL View Result: ${viewResult?.viewName || ''}`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-4">
        {/* SQL Execution Banner */}
        <div className="bg-slate-900 rounded-xl p-4 text-xs font-mono text-slate-200 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 pb-2 mb-2 border-b border-slate-800 text-[11px]">
            <span className="flex items-center gap-1.5 text-indigo-400 font-semibold">
              <Database className="w-3.5 h-3.5" />
              Executed Query on MySQL Server
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Hash className="w-3 h-3 text-slate-400" />
                {viewResult?.rowCount || 0} rows
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <Clock className="w-3 h-3" />
                {viewResult?.executionTimeMs || 0} ms
              </span>
            </div>
          </div>
          <p className="text-emerald-400 break-all">{viewResult?.executedQuery}</p>
        </div>

        {/* Data Table */}
        {isLoading ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            Querying MySQL Server...
          </div>
        ) : rows.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-sm bg-slate-50 rounded-xl">
            No rows returned from this view for the current user.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-96">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100/90 text-slate-700 font-semibold sticky top-0 border-b border-slate-200">
                <tr>
                  {columns.map((col) => (
                    <th key={col} className="px-3.5 py-2.5 whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    {columns.map((col) => {
                      const val = row[col];
                      const isAmount = col.toLowerCase().includes('amount') || col.toLowerCase().includes('spent') || col.toLowerCase().includes('income') || col.toLowerCase().includes('expense') || col.toLowerCase().includes('savings');
                      return (
                        <td key={col} className="px-3.5 py-2 whitespace-nowrap text-slate-700">
                          {isAmount && typeof val === 'number'
                            ? formatCurrency(val)
                            : typeof val === 'object' && val !== null
                            ? JSON.stringify(val)
                            : String(val ?? '')}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </Modal>
  );
};
