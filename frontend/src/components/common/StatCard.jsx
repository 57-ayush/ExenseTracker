import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  variant = 'default' // 'income' | 'expense' | 'savings' | 'budget' | 'default'
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'income':
        return {
          iconBg: 'bg-emerald-50 text-emerald-600',
          accent: 'text-emerald-600'
        };
      case 'expense':
        return {
          iconBg: 'bg-rose-50 text-rose-600',
          accent: 'text-rose-600'
        };
      case 'savings':
        return {
          iconBg: 'bg-sky-50 text-sky-600',
          accent: 'text-sky-600'
        };
      case 'budget':
        return {
          iconBg: 'bg-amber-50 text-amber-600',
          accent: 'text-amber-600'
        };
      default:
        return {
          iconBg: 'bg-indigo-50 text-indigo-600',
          accent: 'text-indigo-600'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${styles.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
        <span>{subtitle}</span>
        {trend && (
          <div className={`flex items-center font-medium gap-1 ${
            trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
          }`}>
            {trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
    </div>
  );
};
