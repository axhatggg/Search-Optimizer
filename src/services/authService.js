import apiService, { API_ENDPOINTS } from './api.js';

export const authService = {
  // Login user
  async login(email, password) {
    try {
      const response = await apiService.post(API_ENDPOINTS.LOGIN, {
        email,
        password,
      });
      
      // Store token in localStorage
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  // Register user
  async register(userData) {
    try {
      const response = await apiService.post(API_ENDPOINTS.REGISTER, userData);
      
      // Store token if auto-login is enabled
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  // Logout user
  async logout() {
    try {
      await apiService.post(API_ENDPOINTS.LOGOUT);
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  },

  // Get user profile
  async getProfile() {
    try {
      const response = await apiService.get(API_ENDPOINTS.USER_PROFILE);
      return response;
    } catch (error) {
      console.error('Get profile failed:', error);
      throw error;
    }
  },

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await apiService.put(API_ENDPOINTS.UPDATE_PROFILE, profileData);
      return response;
    } catch (error) {
      console.error('Update profile failed:', error);
      throw error;
    }
  },

  // Refresh token
  async refreshToken() {
    try {
      const response = await apiService.post(API_ENDPOINTS.REFRESH_TOKEN);
      
      if (response.token) {
        localStorage.setItem('authToken', response.token);
      }
      
      return response;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('authToken');
    return !!token;
  },

  // Get current user from localStorage
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
}; 