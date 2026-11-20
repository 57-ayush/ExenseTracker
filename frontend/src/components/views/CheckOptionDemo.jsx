import React, { useState } from 'react';
import { ShieldAlert, AlertOctagon, CheckCircle2, Play, BookOpen } from 'lucide-react';
import { viewService } from '../../services/viewService';

export const CheckOptionDemo = () => {
  const [loading, setLoading] = useState(false);
  const [demoResult, setDemoResult] = useState(null);
  const [testAction, setTestAction] = useState('UPDATE'); // 'UPDATE' | 'INSERT'

  const runCheckOptionTest = async () => {
    setLoading(true);
    setDemoResult(null);
    try {
      const res = await viewService.demonstrateCheckOption({ action: testAction });
      if (res.success && res.data) {
        setDemoResult(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4 border-b border-slate-100 bg-gradient-to-r from-amber-500/5 to-rose-500/5">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              WITH CHECK OPTION Demonstration & Integrity Verification
            </h3>
            <p className="text-xs text-slate-500">
              DBMS Practical Evaluation Feature: Proving Database-Level Mutation Constraints in MySQL 8.0
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Theory Card */}
        <div className="p-4 bg-slate-50 border border-slate-200/70 rounded-xl text-xs text-slate-600 leading-relaxed">
          <div className="flex items-center gap-2 font-bold text-slate-800 mb-1.5">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>Academic DBMS Concept: Why WITH CHECK OPTION Matters</span>
          </div>
          <p>
            When an updatable view is created <strong className="text-slate-800 font-mono">WITH CHECK OPTION</strong>, MySQL prevents any DML statement (<code className="font-mono text-indigo-600">INSERT</code> or <code className="font-mono text-indigo-600">UPDATE</code>) from producing a row for which the view’s <code className="font-mono text-slate-800">WHERE</code> clause condition evaluates to FALSE or UNKNOWN.
          </p>
          <p className="mt-1.5 text-slate-500">
            Since <code className="font-mono text-slate-700">v_expense_transactions</code> has <code className="font-mono text-indigo-600">WHERE transaction_type = 'EXPENSE' WITH CHECK OPTION</code>, attempting to insert an <code className="font-mono text-rose-600">INCOME</code> or convert an expense into income directly triggers MySQL native <strong>Error 1369</strong>.
          </p>
        </div>

        {/* Action Trigger Area */}
        <div className="p-4 bg-slate-900 rounded-xl text-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-white mb-1">Choose Illegal Mutation to Test on MySQL:</p>
              <div className="flex gap-4 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="checkAction"
                    value="UPDATE"
                    checked={testAction === 'UPDATE'}
                    onChange={() => setTestAction('UPDATE')}
                    className="text-amber-500 focus:ring-0"
                  />
                  <span>UPDATE view row: set transaction_type = 'INCOME'</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="checkAction"
                    value="INSERT"
                    checked={testAction === 'INSERT'}
                    onChange={() => setTestAction('INSERT')}
                    className="text-amber-500 focus:ring-0"
                  />
                  <span>INSERT through view with transaction_type = 'INCOME'</span>
                </label>
              </div>
            </div>

            <button
              onClick={runCheckOptionTest}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 shrink-0"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{loading ? 'Executing on MySQL...' : 'Test WITH CHECK OPTION'}</span>
            </button>
          </div>
        </div>

        {/* Live MySQL Result Display */}
        {demoResult && (
          <div className="border border-rose-200 bg-rose-50/50 rounded-2xl p-5 space-y-4 animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-rose-900">
                  MySQL Intercepted and Blocked the Mutation! (Integrity Guaranteed)
                </h4>
                <p className="text-xs text-rose-700 mt-0.5">
                  The base table remained protected. MySQL returned Error 1369 as expected by relational theory.
                </p>
              </div>
            </div>

            {/* Attempted Query */}
            <div className="bg-slate-950 rounded-xl p-3 text-[11px] font-mono text-slate-300">
              <p className="text-slate-400 text-[10px] mb-1 font-semibold uppercase">Attempted SQL Statement:</p>
              <p className="text-rose-400 break-all">{demoResult.attemptedQuery}</p>
            </div>

            {/* MySQL Error Output */}
            <div className="bg-white border border-rose-200 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-rose-100">
                <span className="font-bold text-rose-800">Actual MySQL 8.0 Response:</span>
                <span className="font-mono text-[11px] px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold">
                  Error Code: {demoResult.mysqlError?.errno} ({demoResult.mysqlError?.sqlState})
                </span>
              </div>
              <p className="font-mono text-slate-800 text-[11px] bg-slate-50 p-2 rounded border border-slate-200">
                {demoResult.mysqlError?.sqlMessage}
              </p>
            </div>

            {/* Evaluation Analysis */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1.5">
              <p className="font-semibold text-slate-800">DBMS Evaluation Explanation:</p>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                {demoResult.educationalExplanation?.whyItFailed}
              </p>
              <div className="pt-1 flex items-center gap-1.5 text-emerald-700 text-[11px] font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{demoResult.educationalExplanation?.dbmsSignificance}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
