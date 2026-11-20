import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '../common/Modal';

export const BudgetModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  categories = [],
  defaultMonth = '',
  isLoading = false
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      categoryId: '',
      budgetMonth: defaultMonth || new Date().toISOString().substring(0, 7),
      budgetAmount: ''
    }
  });

  const expenseCategories = categories.filter(c => c.category_type === 'EXPENSE');

  useEffect(() => {
    if (initialData) {
      reset({
        categoryId: initialData.category_id,
        budgetMonth: initialData.formatted_month || initialData.budget_month?.substring(0, 7),
        budgetAmount: initialData.budget_amount
      });
    } else {
      reset({
        categoryId: expenseCategories.length > 0 ? expenseCategories[0].category_id : '',
        budgetMonth: defaultMonth || new Date().toISOString().substring(0, 7),
        budgetAmount: ''
      });
    }
  }, [initialData, defaultMonth, reset, isOpen]);

  const onFormSubmit = (data) => {
    onSubmit({
      ...data,
      categoryId: parseInt(data.categoryId, 10),
      budgetAmount: parseFloat(data.budgetAmount)
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Category Budget' : 'Set Monthly Category Budget'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Expense Category <span className="text-rose-500">*</span>
          </label>
          <select
            {...register('categoryId', { required: 'Please select an expense category' })}
            disabled={!!initialData}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-100 disabled:text-slate-500"
          >
            <option value="">Select Category</option>
            {expenseCategories.map((c) => (
              <option key={c.category_id} value={c.category_id}>
                {c.category_name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="text-xs text-rose-500 mt-1">{errors.categoryId.message}</p>
          )}
        </div>

        {/* Budget Month */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Budget Month <span className="text-rose-500">*</span>
          </label>
          <input
            type="month"
            {...register('budgetMonth', { required: 'Please select month' })}
            disabled={!!initialData}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-100 disabled:text-slate-500"
          />
          {errors.budgetMonth && (
            <p className="text-xs text-rose-500 mt-1">{errors.budgetMonth.message}</p>
          )}
        </div>

        {/* Budget Amount */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Planned Budget Limit (₹ INR) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-bold text-sm">
              ₹
            </span>
            <input
              type="number"
              step="0.01"
              placeholder="e.g., 10000.00"
              {...register('budgetAmount', {
                required: 'Budget amount is required',
                min: { value: 0.01, message: 'Amount must be greater than zero' }
              })}
              className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
            />
          </div>
          {errors.budgetAmount && (
            <p className="text-xs text-rose-500 mt-1">{errors.budgetAmount.message}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm shadow-indigo-200 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : initialData ? 'Update Budget' : 'Save Budget'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
