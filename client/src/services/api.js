import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// Attach JWT to every request automatically
api.interceptors.request.use(config => {
  const token = localStorage.getItem('mm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);

// Pantry
export const getPantry = () => api.get('/pantry');
export const addPantryItem = (data) => api.post('/pantry', data);
export const updatePantryItem = (id, data) => api.put(`/pantry/${id}`, data);
export const deletePantryItem = (id) => api.delete(`/pantry/${id}`);
export const getExpiring = (days = 3) => api.get(`/pantry/expiring?days=${days}`);

// Recipes
export const getRecommendations = (params) => api.get('/recipes/recommend', { params });
export const getTrending = () => api.get('/recipes/trending');
export const getAllRecipes = (params) => api.get('/recipes/all', { params });
export const getRecipe = (id) => api.get(`/recipes/${id}`);

// Expenses
export const getExpenses = () => api.get('/expenses');
export const addExpense = (data) => api.post('/expenses', data);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);
export const getExpenseSummary = () => api.get('/expenses/summary');

// Chat
export const getChatHistory = () => api.get('/chat');
export const sendMessage = (msg) => api.post('/chat', { message: msg });

// YouTube Trending
export const getTrendingVideos = () => api.get('/youtube');

// Saves
export const getSaved = (q) => api.get('/saves', { params: q ? { q } : {} });
export const getSavedIds = () => api.get('/saves/ids');
export const saveRecipe = (recipe_id) => api.post('/saves', { recipe_id });
export const unsaveRecipe = (recipe_id) => api.delete(`/saves/${recipe_id}`);

// Settings
export const getProfile = () => api.get('/settings');
export const updateName = (data) => api.put('/settings/name', data);
export const updateAvatar = (data) => api.put('/settings/avatar', data);
export const updatePassword = (data) => api.put('/settings/password', data);
export const updatePreferences = (data) => api.put('/settings/preferences', data);
export const deleteAccount = (data) => api.delete('/settings/account', { data });

export default api;