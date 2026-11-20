import api from './api';

export const categoryService = {
  getCategories: (params = {}) => api.get('/categories', { params }),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id, data = {}) => api.delete(`/categories/${id}`, { data })
};
