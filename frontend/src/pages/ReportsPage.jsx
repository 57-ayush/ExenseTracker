import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  CreditCard,
  TrendingUp,
  PieChart as PieIcon,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { reportService } from '../services/reportService';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatMonth } from '../utils/formatters';

const CHART_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#ec4899', '#64748b'];

export const ReportsPage = () => {
  const { error } = useToast();

  const [monthlyReport, setMonthlyReport] = useState([]);
  const [categoryReport, setCategoryReport] = useState(null);
  const [paymentReport, setPaymentReport] = useState([]);
  const [budgetReport, setBudgetReport] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [mRes, cRes, pRes, bRes] = await Promise.all([
        reportService.getMonthlyReport(),
        reportService.getCategoryWiseReport(),
        reportService.getPaymentMethodReport(),
        reportService.getBudgetUtilizationReport()
      ]);

      if (mRes.success) setMonthlyReport(mRes.data);
      if (cRes.success) setCategoryReport(cRes.data);
      if (pRes.success) setPaymentReport(pRes.data);
      if (bRes.success) setBudgetReport(bRes.data);
    } catch (err) {
      error(err.message || 'Failed to generate financial reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExportCsv = () => {
    const url = reportService.downloadCsvUrl();
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Financial Reports & Analytics</h2>
          <p className="text-xs text-slate-500">
            Advanced SQL queries aggregating income, expenses, category distribution & budget variance
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs shadow-indigo-200"
        >
          <Download className="w-4 h-4" />
          <span>Export Full Ledger CSV</span>
        </button>
      </div>

      {/* Row 1: Monthly Cash Flow Comparison (Bar Chart) & Net Savings Trend (Line Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Income vs Expense Bar Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">1. Monthly Inflow vs Outflow</h3>
              <p className="text-[11px] text-slate-400">Comparing total income against total expenses</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md">
              Grouped Bar
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyReport} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="formatted_month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip formatter={(v) => [formatCurrency(v)]} />
                <Legend />
                <Bar dataKey="total_income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="total_expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Net Savings Trend Line Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">2. Net Savings Progression</h3>
              <p className="text-[11px] text-slate-400">Monthly surplus accumulation</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-sky-50 text-sky-700 rounded-md">
              Line Chart
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyReport} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="formatted_month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip formatter={(v) => [formatCurrency(v)]} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="net_savings"
                  name="Net Savings"
                  stroke="#0284c7"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#0284c7' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Category Breakdown & Payment Method Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Expense Table & Aggregates */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">3. Category-Wise Expense Aggregates</h3>
                <p className="text-[11px] text-slate-400">Total volume, averages, and transaction counts</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md">
                AVG, MIN, MAX
              </span>
            </div>

            <div className="overflow-x-auto max-h-64">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold sticky top-0">
                  <tr>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5 text-right">Total Spent</th>
                    <th className="p-2.5 text-right">Avg / Tx</th>
                    <th className="p-2.5 text-right">Share (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categoryReport?.categories?.map((c) => (
                    <tr key={c.category_id} className="hover:bg-slate-50/50">
                      <td className="p-2.5 font-semibold text-slate-800">{c.category_name}</td>
                      <td className="p-2.5 text-right font-bold text-rose-600">{formatCurrency(c.total_spent)}</td>
                      <td className="p-2.5 text-right text-slate-600">{formatCurrency(c.average_per_transaction)}</td>
                      <td className="p-2.5 text-right font-medium text-slate-500">{c.percentage_of_total}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Grand Total Expenditure:</span>
            <span className="text-rose-600">{formatCurrency(categoryReport?.grandTotal || 0)}</span>
          </div>
        </div>

        {/* Payment Methods Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">4. Payment Method Analysis</h3>
              <p className="text-[11px] text-slate-400">UPI, Card, Bank Transfer, and Cash volume</p>
            </div>
            <CreditCard className="w-4 h-4 text-indigo-600" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentReport} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                <YAxis dataKey="payment_method" type="category" stroke="#94a3b8" fontSize={11} />
                <Tooltip formatter={(v) => [formatCurrency(v)]} />
                <Legend />
                <Bar dataKey="total_volume" name="Total Volume" fill="#4f46e5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Planned Budget vs Actual Spending View Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              5. Budget vs Actual Variance (v_budget_utilization)
            </h3>
            <p className="text-[11px] text-slate-400">
              Derived from database view join between budgets and transactions
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-indigo-600 px-2.5 py-1 bg-indigo-50 rounded-lg">
            v_budget_utilization
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Month</th>
                <th className="px-4 py-3 text-right">Budget Limit</th>
                <th className="px-4 py-3 text-right">Actual Spent</th>
                <th className="px-4 py-3 text-right">Remaining</th>
                <th className="px-4 py-3 text-right">Utilization (%)</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {budgetReport.map((b, i) => (
                <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-800">{b.category_name}</td>
                  <td className="px-4 py-3 text-slate-600">{b.formatted_month}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">{formatCurrency(b.budget_amount)}</td>
                  <td className="px-4 py-3 text-right font-bold text-rose-600">{formatCurrency(b.amount_spent)}</td>
                  <td className={`px-4 py-3 text-right font-semibold ${b.remaining_budget < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {formatCurrency(b.remaining_budget)}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-slate-700">{b.percentage_used}%</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      b.budget_status === 'Exceeded'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : b.budget_status === 'Near Limit'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {b.budget_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
