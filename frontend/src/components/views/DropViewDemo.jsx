import React, { useState } from 'react';
import { Trash2, AlertTriangle, ShieldCheck, CheckCircle2, RotateCcw } from 'lucide-react';
import { viewService } from '../../services/viewService';
import { useToast } from '../../context/ToastContext';

export const DropViewDemo = ({ onRestoreSuccess }) => {
  const { success, error } = useToast();
  const [adminMode, setAdminMode] = useState(false);
  const [selectedView, setSelectedView] = useState('v_expense_transactions');
  const [loading, setLoading] = useState(false);
  const [demoOutput, setDemoOutput] = useState(null);

  const handleExecuteDrop = async () => {
    if (!adminMode) {
      error('Administrative Demonstration Mode must be toggled ON to execute DROP VIEW.');
      return;
    }

    setLoading(true);
    setDemoOutput(null);
    try {
      const res = await viewService.demonstrateDropView({
        enableAdminMode: adminMode,
        viewName: selectedView
      });
      if (res.success && res.data) {
        setDemoOutput(res.data);
        success(`Demonstration complete: View '${selectedView}' was dropped and safely re-established.`);
        if (onRestoreSuccess) onRestoreSuccess();
      }
    } catch (err) {
      error(err.message || 'DROP VIEW demonstration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              DROP VIEW Demonstration & Safety Safeguards
            </h3>
            <p className="text-xs text-slate-500">
              Safely observe SQL DDL <code className="font-mono text-rose-600">DROP VIEW</code> execution with auto-recreation
            </p>
          </div>
        </div>

        {/* Admin Mode Switch */}
        <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <input
            type="checkbox"
            checked={adminMode}
            onChange={(e) => setAdminMode(e.target.checked)}
            className="w-4 h-4 text-indigo-600 rounded focus:ring-0 cursor-pointer"
          />
          <span className="text-xs font-semibold text-slate-700">Admin Demo Mode</span>
        </label>
      </div>

      <div className="p-6 space-y-4">
        {/* Notice */}
        <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            <strong>Safety Safeguard:</strong> In production systems, dropping required database views can break dependent controllers. finTrack ensures academic demonstration safety by requiring administrative mode authorization and automatically executing the canonical <code className="font-mono font-bold">CREATE OR REPLACE VIEW</code> immediately following the drop test.
          </p>
        </div>

        {/* Drop execution controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Database View</label>
            <select
              value={selectedView}
              onChange={(e) => setSelectedView(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
            >
              <option value="v_expense_transactions">v_expense_transactions (Updatable)</option>
              <option value="v_transaction_details">v_transaction_details (Joined)</option>
              <option value="v_monthly_expense_summary">v_monthly_expense_summary (Aggregate)</option>
              <option value="v_budget_utilization">v_budget_utilization (Analytical)</option>
            </select>
          </div>

          <div className="sm:self-end">
            <button
              onClick={handleExecuteDrop}
              disabled={loading || !adminMode}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition-all shadow-xs ${
                adminMode
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span>{loading ? 'Executing DDL...' : `DROP & RE-CREATE '${selectedView}'`}</span>
            </button>
          </div>
        </div>

        {/* Output */}
        {demoOutput && (
          <div className="p-4 bg-slate-900 rounded-xl text-xs font-mono text-slate-200 space-y-2 border border-slate-800">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold pb-1 border-b border-slate-800">
              <CheckCircle2 className="w-4 h-4" />
              <span>DDL Execution Completed on MySQL Server 8.0</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">1. Executed Drop:</span>
              <p className="text-rose-400">{demoOutput.executedDropQuery}</p>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">2. Auto Safe Re-creation:</span>
              <p className="text-emerald-300 break-all">{demoOutput.executedRecreateSql}</p>
            </div>
            <div className="pt-1 text-slate-400 text-[11px] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Status: {demoOutput.status}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
