import axios from 'axios';

const API_BASE_URL = 'http://localhost:7000/api';

// Create axios instance with default headers
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('civiceye_token');
  if (token) {
    config.headers['auth-token'] = token;
  }
  return config;
});

// ======================================
// 🔐 AUTHENTICATION ENDPOINTS
// ======================================

export const authAPI = {
  // Generic registration (dispatches based on role)
  register: (data) => apiClient.post('/register', data),

  // Role-specific registration
  registerCitizen: (data) => apiClient.post('/citizen/register', data),
  registerOfficer: (data) => apiClient.post('/officer/register', data),
  registerAdmin: (data) => apiClient.post('/admin/register', data),

  // Generic login
  login: (data) => apiClient.post('/login', data),

  // Role-specific login
  loginCitizen: (data) => apiClient.post('/citizen/login', data),
  loginOfficer: (data) => apiClient.post('/officer/login', data),
  loginAdmin: (data) => apiClient.post('/admin/login', data),
};

// ======================================
// 👤 PROFILE ENDPOINTS
// ======================================

export const profileAPI = {
  getCitizenProfile: () => apiClient.get('/citizen/profile'),
  getOfficerProfile: () => apiClient.get('/officer/profile'),
  getAdminProfile: () => apiClient.get('/admin/profile'),
};

// ======================================
// 📝 CITIZEN COMPLAINT ENDPOINTS
// ======================================

export const citizenAPI = {
  // Report a new issue
  reportIssue: (data) => apiClient.post('/citizen/complaints', data),

  // Get all complaints by citizen
  getAllComplaints: () => apiClient.get('/citizen/complaints'),

  // Get single complaint by ID (issueId or MongoDB _id)
  getComplaintById: (complaintId) => apiClient.get(`/citizen/complaints/${complaintId}`),
};

// ======================================
// 👮 OFFICER COMPLAINT ENDPOINTS
// ======================================

export const officerAPI = {
  // Get all complaints assigned to officer's department
  getAssignedComplaints: () => apiClient.get('/officer/complaints'),

  // Update complaint status
  updateComplaintStatus: (complaintId, status) =>
    apiClient.put(`/officer/complaints/${complaintId}/status`, { status }),
};

// ======================================
// 🔧 ADMIN COMPLAINT ENDPOINTS
// ======================================

export const adminAPI = {
  // Complaint / issue endpoints
  getAllComplaints: (params = {}) => apiClient.get('/admin/complaints', { params }),
  assignOfficer: (complaintId, officerId) => apiClient.put(`/admin/complaints/${complaintId}/assign`, { officerId }),
  markUrgent: (complaintId) => apiClient.put(`/admin/complaints/${complaintId}/urgent`),
  escalate: (complaintId) => apiClient.put(`/admin/complaints/${complaintId}/escalate`),
  autoAssignByCategory: () => apiClient.post('/admin/complaints/auto-assign'),

  // User endpoints
  getAllCitizens: () => apiClient.get('/admin/citizens'),
  getAllOfficers: () => apiClient.get('/admin/officers'),
  createOfficer: (data) => apiClient.post('/admin/officers', data),
  updateOfficer: (id, data) => apiClient.put(`/admin/officers/${id}`, data),
  deleteOfficer: (id) => apiClient.delete(`/admin/officers/${id}`),

  // Area endpoints
  getAllAreas: () => apiClient.get('/admin/areas'),
  createArea: (data) => apiClient.post('/admin/areas', data),
  updateArea: (id, data) => apiClient.put(`/admin/areas/${id}`, data),
  deleteArea: (id) => apiClient.delete(`/admin/areas/${id}`),
  assignOfficerToArea: (id, officerId) => apiClient.put(`/admin/areas/${id}/assign-officer`, { officerId }),

  // Feedback
  getAllFeedback: () => apiClient.get('/admin/feedback'),

  // Settings
  getSettings: () => apiClient.get('/admin/settings'),
  updateSettings: (data) => apiClient.put('/admin/settings', data),
};

// ======================================
// 📚 HELP/FAQ ENDPOINTS
// ======================================

export const helpAPI = {
  getAllHelp: () => apiClient.get('/help'),
  searchHelp: (query) => apiClient.get(`/help/search?query=${encodeURIComponent(query)}`),
  getHelpByCategory: (category) => apiClient.get(`/help/category/${encodeURIComponent(category)}`),
};

// ======================================
// �️ CATEGORY ENDPOINTS
// ======================================

export const categoryAPI = {
  getAll: () => apiClient.get('/admin/categories'),
  add: (data) => apiClient.post('/admin/categories', data),
  edit: (id, data) => apiClient.put(`/admin/categories/${id}`, data),
  delete: (id) => apiClient.delete(`/admin/categories/${id}`),
};

// ======================================
// �🔧 UTILITY FUNCTIONS
// ======================================

export const handleApiError = (error) => {
  const message = error.response?.data?.message || error.message || 'An error occurred';
  const status = error.response?.status;
  
  return {
    message,
    status,
    error: error.response?.data?.error || null,
  };
};

export default apiClient;
