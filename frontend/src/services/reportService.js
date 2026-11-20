import api from './api';

export const reportService = {
  getMonthlyReport: () => api.get('/reports/monthly'),
  getCategoryWiseReport: (params = {}) => api.get('/reports/category-wise', { params }),
  getPaymentMethodReport: (params = {}) => api.get('/reports/payment-methods', { params }),
  getBudgetUtilizationReport: () => api.get('/reports/budget-utilization'),
  downloadCsvUrl: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return `/api/reports/export-csv${query ? `?${query}` : ''}`;
  }
};
