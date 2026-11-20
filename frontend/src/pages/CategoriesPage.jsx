import React, { useState, useEffect } from 'react';
import {
  Plus,
  Tags,
  TrendingUp,
  CreditCard,
  Edit2,
  Trash2,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { categoryService } from '../services/categoryService';
import { CategoryModal } from '../components/categories/CategoryModal';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { useToast } from '../context/ToastContext';

export const CategoriesPage = () => {
  const { success, error } = useToast();

  const [categories, setCategories] = useState({ all: [], income: [], expense: [] });
  const [loading, setLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);
  const [deleteTargetCat, setDeleteTargetCat] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryService.getCategories();
      if (res.success && res.data) {
        setCategories(res.data);
      }
    } catch (err) {
      error(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSaveCategory = async (formData) => {
    setSubmitting(true);
    try {
      if (selectedCat) {
        await categoryService.updateCategory(selectedCat.category_id, formData);
        success('Category updated successfully!');
      } else {
        await categoryService.createCategory(formData);
        success('Category created successfully!');
      }
      setIsModalOpen(false);
      setSelectedCat(null);
      fetchCategories();
    } catch (err) {
      error(err.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteTargetCat) return;
    setSubmitting(true);
    try {
      await categoryService.deleteCategory(deleteTargetCat.category_id);
      success(`Category '${deleteTargetCat.category_name}' deleted successfully.`);
      setDeleteTargetCat(null);
      fetchCategories();
    } catch (err) {
      error(err.message || 'Cannot delete referenced category');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Category Management</h2>
          <p className="text-xs text-slate-500">
            Define classification taxonomies for income and expense transactions
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedCat(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs shadow-indigo-200"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Referential Integrity Explanatory Box */}
      <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-start gap-3 text-xs text-indigo-900">
        <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">DBMS Referential Integrity Constraint:</span> Categories with existing transactions or active monthly budgets cannot be deleted without reassigning or deleting the dependent records first. This preserves foreign key consistency (<code className="font-mono text-indigo-700 font-semibold">ON DELETE RESTRICT</code>) in MySQL.
        </div>
      </div>

      {/* Two Columns: Income & Expense Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Categories */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Expense Categories</h3>
                <p className="text-[11px] text-slate-400">{categories.expense.length} categories defined</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full">
              EXPENSE
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {categories.expense.map((cat) => (
              <div key={cat.category_id} className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{cat.category_name}</h4>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-0.5">
                    <span>{cat.transaction_count || 0} transactions</span>
                    <span>•</span>
                    <span>{cat.budget_count || 0} budgets</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setSelectedCat(cat);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit category"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTargetCat(cat)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Income Categories */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Income Categories</h3>
                <p className="text-[11px] text-slate-400">{categories.income.length} categories defined</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
              INCOME
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {categories.income.map((cat) => (
              <div key={cat.category_id} className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{cat.category_name}</h4>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-0.5">
                    <span>{cat.transaction_count || 0} transactions</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setSelectedCat(cat);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit category"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTargetCat(cat)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCat(null);
        }}
        onSubmit={handleSaveCategory}
        initialData={selectedCat}
        isLoading={submitting}
      />

      <ConfirmationModal
        isOpen={!!deleteTargetCat}
        onClose={() => setDeleteTargetCat(null)}
        onConfirm={handleDeleteCategory}
        title="Delete Category"
        message={`Are you sure you want to delete category '${deleteTargetCat?.category_name}'? If transactions reference this category, MySQL referential integrity rules will block deletion.`}
        confirmText="Confirm Delete"
        isLoading={submitting}
      />
    </div>
  );
};
