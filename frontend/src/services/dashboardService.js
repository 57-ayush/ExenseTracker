import api from './api';

export const dashboardService = {
  getSummary: (params = {}) => api.get('/dashboard/summary', { params }),
  getMonthlyTrends: () => api.get('/dashboard/monthly-trends'),
  getCategoryBreakdown: (params = {}) => api.get('/dashboard/category-breakdown', { params }),
  getRecentTransactions: () => api.get('/dashboard/recent-transactions')
};
