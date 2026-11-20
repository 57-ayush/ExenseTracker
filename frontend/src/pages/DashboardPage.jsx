import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  PiggyBank,
  PieChart as PieIcon,
  Calendar,
  ArrowRight,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import { dashboardService } from '../services/dashboardService';
import { budgetService } from '../services/budgetService';
import { StatCard } from '../components/common/StatCard';
import { CardSkeleton, TableSkeleton } from '../components/common/LoadingSkeleton';
import { formatCurrency, formatDate } from '../utils/formatters';

const PIE_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#ec4899', '#64748b'];

export const DashboardPage = () => {
  const [filter, setFilter] = useState('this-month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [summary, setSummary] = useState(null);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const params = { filter };
      if (filter === 'custom' && customStart && customEnd) {
        params.startDate = customStart;
        params.endDate = customEnd;
      }

      const [sumRes, trendsRes, catRes, recentRes, budgetsRes] = await Promise.all([
        dashboardService.getSummary(params),
        dashboardService.getMonthlyTrends(),
        dashboardService.getCategoryBreakdown(params),
        dashboardService.getRecentTransactions(),
        budgetService.getBudgets()
      ]);

      if (sumRes.success) setSummary(sumRes.data);
      if (trendsRes.success) setMonthlyTrends(trendsRes.data);
      if (catRes.success) setCategoryBreakdown(catRes.data);
      if (recentRes.success) setRecentTransactions(recentRes.data);
      if (budgetsRes.success) setBudgets(budgetsRes.data.slice(0, 4));
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [filter]);

  const handleApplyCustomFilter = (e) => {
    e.preventDefault();
    if (customStart && customEnd) {
      setFilter('custom');
      fetchDashboardData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Analytics Period</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'this-month', label: 'This Month' },
            { id: 'last-month', label: 'Last Month' },
            { id: '3-months', label: 'Last 3 Months' },
            { id: 'this-year', label: 'This Year' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                filter === f.id
                  ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}

          {/* Custom Date Inputs */}
          <div className="flex items-center gap-2 ml-1 pl-2 border-l border-slate-200">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
            <span className="text-slate-400 text-xs">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
            <button
              onClick={handleApplyCustomFilter}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-800 text-white hover:bg-slate-700 rounded-xl transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {loading && !summary ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Income"
            value={formatCurrency(summary?.totalIncome || 0)}
            subtitle="Current Selected Period"
            icon={TrendingUp}
            variant="income"
            trend={summary?.totalIncome > 0 ? 'up' : null}
            trendValue="Inflow"
          />
          <StatCard
            title="Total Expenses"
            value={formatCurrency(summary?.totalExpenses || 0)}
            subtitle={`${summary?.transactionCount || 0} Transactions`}
            icon={CreditCard}
            variant="expense"
            trend={summary?.totalExpenses > 0 ? 'down' : null}
            trendValue="Outflow"
          />
          <StatCard
            title="Net Savings"
            value={formatCurrency(summary?.netSavings || 0)}
            subtitle={`Savings Rate: ${summary?.savingsRate || 0}%`}
            icon={PiggyBank}
            variant="savings"
            trend={summary?.netSavings >= 0 ? 'up' : 'down'}
            trendValue={summary?.netSavings >= 0 ? 'Positive' : 'Deficit'}
          />
          <StatCard
            title="Active Monthly Budget"
            value={formatCurrency(summary?.monthlyBudget || 0)}
            subtitle={
              summary?.highestCategory
                ? `Top: ${summary.highestCategory.name} (${summary.highestCategory.percentage}%)`
                : 'No budgets defined'
            }
            icon={Wallet}
            variant="budget"
          />
        </div>
      )}

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Trend (2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800">Monthly Spending & Income Trends</h3>
              <p className="text-xs text-slate-400">Aggregated historical monthly cash flow</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg">
              Live SQL GROUP BY
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="monthLabel" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(value) => [formatCurrency(value)]}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
                />
                <Legend />
                <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#incomeGradient)" />
                <Area type="monotone" dataKey="expense" name="Expense" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#expenseGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut Chart (1 column) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800">Expense Categories</h3>
                <p className="text-xs text-slate-400">Distribution of expenditures</p>
              </div>
              <PieIcon className="w-4 h-4 text-indigo-600" />
            </div>

            <div className="h-56 w-full">
              {categoryBreakdown?.categories?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown.categories}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {categoryBreakdown.categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [formatCurrency(value)]} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No expense records in this period
                </div>
              )}
            </div>
          </div>

          {/* Top 3 categories list */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            {categoryBreakdown?.categories?.slice(0, 3).map((cat, idx) => (
              <div key={cat.categoryId} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                  <span className="font-medium text-slate-700">{cat.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-800">{formatCurrency(cat.value)}</span>
                  <span className="text-slate-400 text-[10px] ml-1.5">({cat.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower Row: Recent Transactions & Budget Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions (2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Recent Transactions</h3>
              <p className="text-xs text-slate-400">Latest entries recorded in MySQL</p>
            </div>
            <Link
              to="/transactions"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No transactions recorded yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-400 border-b border-slate-100 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Method</th>
                    <th className="pb-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentTransactions.map((tx) => (
                    <tr key={tx.transaction_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 text-slate-600 font-medium">{formatDate(tx.transaction_date)}</td>
                      <td className="py-3">
                        <span className="font-semibold text-slate-800 block">{tx.category_name}</span>
                        <span className="text-[10px] text-slate-400 truncate max-w-xs block">{tx.description || 'No description'}</span>
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                          {tx.payment_method}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <span className={`font-bold ${
                          tx.transaction_type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {tx.transaction_type === 'INCOME' ? '+' : '-'} {formatCurrency(tx.amount)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Budget Utilization Progress Bars (1 column) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800">Budget Progress</h3>
                <p className="text-xs text-slate-400">Monthly budget thresholds</p>
              </div>
              <Link to="/budgets" className="text-xs text-indigo-600 font-semibold hover:underline">
                Manage
              </Link>
            </div>

            {budgets.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No active monthly budgets configured
              </div>
            ) : (
              <div className="space-y-4">
                {budgets.map((b) => {
                  const pct = Math.min(b.percentage_used || 0, 100);
                  const isExceeded = b.budget_status === 'Exceeded';
                  const isNear = b.budget_status === 'Near Limit';

                  return (
                    <div key={b.budget_id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">{b.category_name}</span>
                        <span className={`text-[11px] font-bold ${
                          isExceeded ? 'text-rose-600' : isNear ? 'text-amber-600' : 'text-slate-600'
                        }`}>
                          {b.percentage_used}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isExceeded ? 'bg-rose-500' : isNear ? 'bg-amber-500' : 'bg-indigo-600'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>Spent: {formatCurrency(b.amount_spent)}</span>
                        <span>Limit: {formatCurrency(b.budget_amount)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 text-center">
            <Link
              to="/database-views"
              className="text-xs text-indigo-600 font-semibold hover:text-indigo-700 inline-flex items-center gap-1"
            >
              <span>Examine SQL View: `v_budget_utilization`</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
