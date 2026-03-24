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
  } else {
    console.warn('No authentication token found. Redirecting to login.');
    // Optionally, redirect to login page or handle missing token
  }
  return config;
}, (error) => {
  console.error('Error in request interceptor:', error);
  return Promise.reject(error);
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
  updateCitizenProfile: (data) => apiClient.put('/citizen/profile', data),
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
  getNotifications: () => apiClient.get('/citizen/notifications'),
  markNotificationRead: (id) => apiClient.post(`/citizen/notifications/${id}/read`),
  getFeedback: () => apiClient.get('/citizen/feedback'),
  submitFeedback: (data) => apiClient.post('/citizen/feedback', data),
};

// ======================================
// 👮 OFFICER COMPLAINT ENDPOINTS
// ======================================

export const officerAPI = {
  // Get all complaints assigned to officer's department
  getAssignedComplaints: () => apiClient.get('/officer/complaints'),

  // Update complaint status with optional image and notes
  updateComplaintStatus: (complaintId, status, formData = null) => {
    if (formData) {
      // Send FormData with file upload
      return apiClient.put(`/officer/complaints/${complaintId}/status`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } else {
      // Send simple JSON for status-only updates
      return apiClient.put(`/officer/complaints/${complaintId}/status`, { status });
    }
  },

  // Get officer performance analytics
  getOfficerPerformance: () => apiClient.get('/officer/performance'),
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
  updateCitizen: (id, data) => apiClient.put(`/admin/citizens/${id}`, data),
  deleteOfficer: (id) => apiClient.delete(`/admin/officers/${id}`),
  blockCitizen: (id, blocked) => apiClient.put(`/admin/citizens/${id}/block`, { blocked }),
  blockOfficer: (id, blocked) => apiClient.put(`/admin/officers/${id}/block`, { blocked }),

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
  // Public areas endpoint (no auth required)
  getAllAreas: () => apiClient.get('/help/areas'),
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

// Export reportAPI for compatibility
export const reportAPI = {
  submitIssue: citizenAPI.reportIssue,
};

export default apiClient;
