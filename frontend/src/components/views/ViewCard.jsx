import React, { useState } from 'react';
import { Database, CheckCircle2, Lock, Eye, Copy, Check } from 'lucide-react';

export const ViewCard = ({ view, onQueryData }) => {
  const [copied, setCopied] = useState(false);

  const handleCopySql = () => {
    navigator.clipboard.writeText(view.sqlDefinition);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
      {/* Top Banner */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{view.viewName}</h3>
              <p className="text-xs text-indigo-600 font-medium">{view.displayName}</p>
            </div>
          </div>

          {/* Updatable Badge */}
          {view.isUpdatable ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Updatable (CRUD)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              Read-Only
            </span>
          )}
        </div>

        {/* View Type & DBMS Concept */}
        <div className="flex flex-wrap gap-2 my-2 text-xs">
          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium">
            Type: {view.viewType}
          </span>
          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg font-medium">
            {view.dbmsConcept}
          </span>
        </div>

        {/* Purpose */}
        <p className="text-xs text-slate-600 leading-relaxed mt-2">
          {view.purpose}
        </p>

        {/* SQL Definition Code Box */}
        <div className="mt-4 relative group">
          <div className="flex items-center justify-between bg-slate-900 text-slate-300 px-3.5 py-2 rounded-t-xl text-[11px] font-mono border-b border-slate-800">
            <span>MySQL Definition</span>
            <button
              onClick={handleCopySql}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy SQL'}</span>
            </button>
          </div>
          <pre className="p-3.5 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-b-xl overflow-x-auto max-h-40 leading-relaxed">
            {view.sqlDefinition}
          </pre>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-500">Live query on MySQL 8.0</span>
        <button
          onClick={() => onQueryData(view.viewName)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs shadow-indigo-200"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>SELECT from View</span>
        </button>
      </div>
    </div>
  );
};
