import api from './api';

export const budgetService = {
  getBudgets: (params = {}) => api.get('/budgets', { params }),
  createBudget: (data) => api.post('/budgets', data),
  updateBudget: (id, data) => api.put(`/budgets/${id}`, data),
  deleteBudget: (id) => api.delete(`/budgets/${id}`)
};
