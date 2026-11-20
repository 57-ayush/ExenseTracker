import api from './api';

export const viewService = {
  getViewList: () => api.get('/views'),
  getViewData: (viewName, limit = 50) => api.get(`/views/${viewName}/data`, { params: { limit } }),
  insertThroughView: (data) => api.post('/views/expense-transactions', data),
  updateThroughView: (id, data) => api.put(`/views/expense-transactions/${id}`, data),
  deleteThroughView: (id) => api.delete(`/views/expense-transactions/${id}`),
  demonstrateCheckOption: (payload) => api.post('/views/demonstrate-check-option', payload),
  createSandboxRecord: () => api.post('/views/create-sandbox-record'),
  demonstrateDropView: (payload) => api.post('/views/demonstrate-drop-view', payload)
};
