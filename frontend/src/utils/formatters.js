/**
 * Utility functions for currency and date formatting
 */

export const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  } catch {
    return dateStr;
  }
};

export const formatMonth = (monthStr) => {
  if (!monthStr) return 'N/A';
  try {
    const parts = monthStr.split('-');
    const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
    return new Intl.DateTimeFormat('en-IN', {
      month: 'short',
      year: 'numeric'
    }).format(date);
  } catch {
    return monthStr;
  }
};

export const formatPercentage = (value) => {
  const num = Number(value) || 0;
  return `${num.toFixed(1)}%`;
};
