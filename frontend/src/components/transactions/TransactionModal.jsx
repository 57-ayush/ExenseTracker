import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '../common/Modal';

export const TransactionModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  categories = [],
  isLoading = false
}) => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      transactionType: 'EXPENSE',
      amount: '',
      categoryId: '',
      transactionDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'UPI',
      description: ''
    }
  });

  const selectedType = watch('transactionType');

  // Filter categories matching current transaction type
  const filteredCategories = categories.filter(c => c.category_type === selectedType);

  useEffect(() => {
    if (initialData) {
      reset({
        transactionType: initialData.transaction_type,
        amount: initialData.amount,
        categoryId: initialData.category_id,
        transactionDate: initialData.transaction_date,
        paymentMethod: initialData.payment_method,
        description: initialData.description || ''
      });
    } else {
      reset({
        transactionType: 'EXPENSE',
        amount: '',
        categoryId: '',
        transactionDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'UPI',
        description: ''
      });
    }
  }, [initialData, reset, isOpen]);

  // When type changes and current category doesn't match, auto-select first matching category
  useEffect(() => {
    if (!initialData && filteredCategories.length > 0) {
      setValue('categoryId', filteredCategories[0].category_id);
    }
  }, [selectedType, categories]);

  const onFormSubmit = (data) => {
    onSubmit({
      ...data,
      amount: parseFloat(data.amount),
      categoryId: parseInt(data.categoryId, 10)
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Transaction' : 'Record New Transaction'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        {/* Transaction Type Radio Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Transaction Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-semibold cursor-pointer transition-all ${
                selectedType === 'EXPENSE'
                  ? 'bg-rose-50 border-rose-400 text-rose-700 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                value="EXPENSE"
                {...register('transactionType')}
                className="sr-only"
              />
              <span>Expense</span>
            </label>
            <label
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-semibold cursor-pointer transition-all ${
                selectedType === 'INCOME'
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-700 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                value="INCOME"
                {...register('transactionType')}
                className="sr-only"
              />
              <span>Income</span>
            </label>
          </div>
        </div>

        {/* Amount Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Amount (₹ INR) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-bold text-sm">
              ₹
            </span>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('amount', {
                required: 'Amount is required',
                min: { value: 0.01, message: 'Amount must be greater than zero' }
              })}
              className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
            />
          </div>
          {errors.amount && (
            <p className="text-xs text-rose-500 mt-1">{errors.amount.message}</p>
          )}
        </div>

        {/* Category Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Category <span className="text-rose-500">*</span>
          </label>
          <select
            {...register('categoryId', { required: 'Please select a category' })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="">Select a Category</option>
            {filteredCategories.map((cat) => (
              <option key={cat.category_id} value={cat.category_id}>
                {cat.category_name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="text-xs text-rose-500 mt-1">{errors.categoryId.message}</p>
          )}
        </div>

        {/* Date & Payment Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Transaction Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              {...register('transactionDate', { required: 'Date is required' })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            {errors.transactionDate && (
              <p className="text-xs text-rose-500 mt-1">{errors.transactionDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Payment Method
            </label>
            <select
              {...register('paymentMethod')}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="UPI">UPI</option>
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Description / Memo (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g., Grocery shopping at Nature Basket"
            {...register('description', {
              maxLength: { value: 255, message: 'Max 255 characters allowed' }
            })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
          {errors.description && (
            <p className="text-xs text-rose-500 mt-1">{errors.description.message}</p>
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
            {isLoading ? 'Saving...' : initialData ? 'Update Transaction' : 'Save Transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
