import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '../common/Modal';

export const CategoryModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      categoryName: '',
      categoryType: 'EXPENSE'
    }
  });

  const selectedType = watch('categoryType');

  useEffect(() => {
    if (initialData) {
      reset({
        categoryName: initialData.category_name,
        categoryType: initialData.category_type
      });
    } else {
      reset({
        categoryName: '',
        categoryType: 'EXPENSE'
      });
    }
  }, [initialData, reset, isOpen]);

  const onFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Category' : 'Create New Category'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        {/* Category Type */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Category Type
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
                {...register('categoryType')}
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
                {...register('categoryType')}
                className="sr-only"
              />
              <span>Income</span>
            </label>
          </div>
        </div>

        {/* Category Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Category Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g., Subscriptions, Pet Care"
            {...register('categoryName', {
              required: 'Category name is required',
              minLength: { value: 2, message: 'Minimum 2 characters required' },
              maxLength: { value: 60, message: 'Maximum 60 characters allowed' }
            })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
          />
          {errors.categoryName && (
            <p className="text-xs text-rose-500 mt-1">{errors.categoryName.message}</p>
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
            {isLoading ? 'Saving...' : initialData ? 'Update Category' : 'Create Category'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
