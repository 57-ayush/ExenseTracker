import React, { useState, useEffect } from 'react';
import {
  Database,
  BookOpen,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { viewService } from '../services/viewService';
import { categoryService } from '../services/categoryService';
import { ViewCard } from '../components/views/ViewCard';
import { ViewDataModal } from '../components/views/ViewDataModal';
import { ViewMutationConsole } from '../components/views/ViewMutationConsole';
import { CheckOptionDemo } from '../components/views/CheckOptionDemo';
import { DropViewDemo } from '../components/views/DropViewDemo';
import { useToast } from '../context/ToastContext';

export const DatabaseViewsPage = () => {
  const { error } = useToast();

  const [views, setViews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Data modal states
  const [activeModalView, setActiveModalView] = useState(null);
  const [viewResult, setViewResult] = useState(null);
  const [queryLoading, setQueryLoading] = useState(false);

  const fetchViewMetadata = async () => {
    setLoading(true);
    try {
      const [vRes, cRes] = await Promise.all([
        viewService.getViewList(),
        categoryService.getCategories()
      ]);

      if (vRes.success) setViews(vRes.data);
      if (cRes.success) setCategories(cRes.data.all || []);
    } catch (err) {
      error(err.message || 'Failed to load view definitions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViewMetadata();
  }, []);

  const handleOpenViewData = async (viewName) => {
    setActiveModalView(viewName);
    setQueryLoading(true);
    try {
      const res = await viewService.getViewData(viewName);
      if (res.success && res.data) {
        setViewResult(res.data);
      }
    } catch (err) {
      error(err.message || `Failed to fetch rows from view ${viewName}`);
    } finally {
      setQueryLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-[11px] font-bold bg-indigo-100 text-indigo-700 rounded-md">
              B.Tech DBMS Practical Assessment
            </span>
            <span className="px-2.5 py-0.5 text-[11px] font-bold bg-emerald-100 text-emerald-800 rounded-md">
              MySQL 8.0 Live
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            Database Views Laboratory Module
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Interactive demonstrations of SQL Views, Joins, Aggregations, Updatability, and WITH CHECK OPTION
          </p>
        </div>

        <button
          onClick={fetchViewMetadata}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh View Metadata</span>
        </button>
      </div>

      {/* Conceptual Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-3xl relative z-10 space-y-4">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>DBMS Theoretical Foundation</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white">
            What is a Database View?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            In relational database management systems (RDBMS), a <strong>View</strong> is a <em>virtual table</em> whose contents are dynamically populated by executing a pre-defined SQL query. Unlike physical base tables, standard views do not store redundant data rows on disk; they provide a <strong>logical abstraction layer</strong> that enhances security, hides sensitive columns, simplifies complex JOIN syntax, and enforces relational integrity.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="bg-slate-800/80 backdrop-blur-xs p-3 rounded-xl border border-slate-700">
              <span className="font-bold text-indigo-300 block mb-1">1. Abstraction & Security</span>
              <p className="text-slate-400 text-[11px]">
                Restricts direct access to base tables while allowing users to query tailored subsets of data.
              </p>
            </div>
            <div className="bg-slate-800/80 backdrop-blur-xs p-3 rounded-xl border border-slate-700">
              <span className="font-bold text-emerald-300 block mb-1">2. Updatable Views</span>
              <p className="text-slate-400 text-[11px]">
                Single-table views without aggregates support direct <code className="font-mono">INSERT</code>, <code className="font-mono">UPDATE</code>, and <code className="font-mono">DELETE</code>.
              </p>
            </div>
            <div className="bg-slate-800/80 backdrop-blur-xs p-3 rounded-xl border border-slate-700">
              <span className="font-bold text-amber-300 block mb-1">3. WITH CHECK OPTION</span>
              <p className="text-slate-400 text-[11px]">
                Guarantees that no mutation through the view can violate the view's defining <code className="font-mono">WHERE</code> condition.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: The 4 Database View Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-800">
              Defined MySQL Database Views (4 Active Views)
            </h3>
          </div>
          <span className="text-xs text-slate-500">Click "SELECT from View" to query live MySQL</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {views.map((view) => (
            <ViewCard
              key={view.viewName}
              view={view}
              onQueryData={handleOpenViewData}
            />
          ))}
        </div>
      </div>

      {/* Section 2: Interactive View Mutation Console (DML) */}
      <ViewMutationConsole
        categories={categories}
        onOperationSuccess={() => {}}
      />

      {/* Section 3: WITH CHECK OPTION Demonstration */}
      <CheckOptionDemo />

      {/* Section 4: DROP VIEW & Recreate Demonstration */}
      <DropViewDemo onRestoreSuccess={fetchViewMetadata} />

      {/* Modal for viewing SELECT results from view */}
      <ViewDataModal
        isOpen={!!activeModalView}
        onClose={() => {
          setActiveModalView(null);
          setViewResult(null);
        }}
        viewResult={viewResult}
        isLoading={queryLoading}
      />
    </div>
  );
};
