import React, { useState, useEffect } from 'react';
import {
  Plus,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Edit2,
  Trash2,
  PieChart as PieIcon,
  TrendingDown
} from 'lucide-react';
import { budgetService } from '../services/budgetService';
import { categoryService } from '../services/categoryService';
import { BudgetModal } from '../components/budgets/BudgetModal';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatMonth } from '../utils/formatters';

export const BudgetsPage = () => {
  const { success, error } = useToast();

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [budgets, setBudgets] = useState([]);
  const [meta, setMeta] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await budgetService.getBudgets({ month: selectedMonth });
      if (res.success) {
        setBudgets(res.data);
        if (res.meta) setMeta(res.meta);
      }
    } catch (err) {
      error(err.message || 'Failed to fetch budgets');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getCategories({ type: 'EXPENSE' });
      if (res.success && res.data) {
        setCategories(res.data.expense || res.data.all || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [selectedMonth]);

  const handleSaveBudget = async (formData) => {
    setSubmitting(true);
    try {
      if (selectedBudget) {
        await budgetService.updateBudget(selectedBudget.budget_id, formData);
        success('Budget updated successfully!');
      } else {
        await budgetService.createBudget(formData);
        success('Budget configured successfully!');
      }
      setIsModalOpen(false);
      setSelectedBudget(null);
      fetchBudgets();
    } catch (err) {
      error(err.message || 'Failed to save budget');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBudget = async () => {
    if (!deleteTargetId) return;
    setSubmitting(true);
    try {
      await budgetService.deleteBudget(deleteTargetId);
      success('Budget removed successfully.');
      setDeleteTargetId(null);
      fetchBudgets();
    } catch (err) {
      error(err.message || 'Failed to delete budget');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Monthly Budget Management</h2>
          <p className="text-xs text-slate-500">
            Set and monitor category spending thresholds evaluated against live transactions
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Month Selector */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-xl shadow-xs">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-transparent focus:outline-none"
            />
          </div>

          <button
            onClick={() => {
              setSelectedBudget(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs shadow-indigo-200"
          >
            <Plus className="w-4 h-4" />
            <span>Set Budget</span>
          </button>
        </div>
      </div>

      {/* Aggregate Overview Card */}
      {meta && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <span className="text-xs font-medium text-slate-400 block">Total Budget Planned</span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">
              {formatCurrency(meta.totalBudget)}
            </span>
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400 block">Actual Amount Spent</span>
            <span className="text-xl font-bold text-rose-600 mt-1 block">
              {formatCurrency(meta.totalSpent)}
            </span>
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400 block">Remaining Budget</span>
            <span className={`text-xl font-bold mt-1 block ${
              meta.totalRemaining >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {formatCurrency(meta.totalRemaining)}
            </span>
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400 block">Overall Utilization</span>
            <span className="text-xl font-bold text-indigo-600 mt-1 block">
              {meta.overallPercentage}%
            </span>
          </div>
        </div>
      )}

      {/* Budgets Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading monthly budget utilization...</div>
      ) : budgets.length === 0 ? (
        <EmptyState
          title="No Budgets Set For This Month"
          description={`You haven't set any category budgets for ${formatMonth(selectedMonth)}. Configure category limits to keep spending on track.`}
          actionLabel="Create Category Budget"
          onAction={() => {
            setSelectedBudget(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgets.map((b) => {
            const isExceeded = b.budget_status === 'Exceeded';
            const isNear = b.budget_status === 'Near Limit';
            const pct = Math.min(b.percentage_used || 0, 100);

            return (
              <div
                key={b.budget_id}
                className={`bg-white rounded-2xl p-5 border shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                  isExceeded ? 'border-rose-200' : isNear ? 'border-amber-200' : 'border-slate-200/80'
                }`}
              >
                <div>
                  {/* Category Title & Status Badge */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">{b.category_name}</h3>
                      <p className="text-[11px] text-slate-400">{formatMonth(b.budget_month)}</p>
                    </div>

                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isExceeded
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : isNear
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {isExceeded && <AlertOctagon className="w-3 h-3 text-rose-600" />}
                      {isNear && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                      {!isExceeded && !isNear && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      <span>{b.budget_status}</span>
                    </span>
                  </div>

                  {/* Amounts */}
                  <div className="grid grid-cols-2 gap-2 my-4 p-3 bg-slate-50/80 rounded-xl text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Spent</span>
                      <span className="font-bold text-slate-900 block mt-0.5">
                        {formatCurrency(b.amount_spent)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Budget Limit</span>
                      <span className="font-bold text-slate-900 block mt-0.5">
                        {formatCurrency(b.budget_amount)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 mb-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold">
                      <span className="text-slate-500">Utilization</span>
                      <span className={isExceeded ? 'text-rose-600' : isNear ? 'text-amber-600' : 'text-slate-700'}>
                        {b.percentage_used}%
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isExceeded ? 'bg-rose-500' : isNear ? 'bg-amber-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Remaining text */}
                  <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                    <span>Remaining:</span>
                    <span className={`font-semibold ${b.remaining_budget < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {formatCurrency(b.remaining_budget)}
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setSelectedBudget(b);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit Budget"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTargetId(b.budget_id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Budget"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBudget(null);
        }}
        onSubmit={handleSaveBudget}
        initialData={selectedBudget}
        categories={categories}
        defaultMonth={selectedMonth}
        isLoading={submitting}
      />

      <ConfirmationModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteBudget}
        title="Delete Budget"
        message="Are you sure you want to remove this monthly category budget limit?"
        confirmText="Remove Budget"
        isLoading={submitting}
      />
    </div>
  );
};
