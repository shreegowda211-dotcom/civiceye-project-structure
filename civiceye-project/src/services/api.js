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
  // Get all complaints for platform statistics
  getAllComplaints: () => apiClient.get('/admin/complaints'),
  
  // Get all citizens
  getAllCitizens: () => apiClient.get('/admin/citizens'),
  
  // Get all officers
  getAllOfficers: () => apiClient.get('/admin/officers'),
  
  // Create new officer
  createOfficer: (data) => apiClient.post('/admin/officers', data),
};

// ======================================
// 🔧 UTILITY FUNCTIONS
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
