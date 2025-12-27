import { API_CONFIG, getApiUrl, isApiAvailable } from '@/config/api.js';

// API Service class
class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.retryAttempts = API_CONFIG.RETRY_ATTEMPTS;
    this.retryDelay = API_CONFIG.RETRY_DELAY;
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem(API_CONFIG.AUTH_TOKEN_KEY);
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Generic request method with retry logic
  async request(endpoint, options = {}, retryCount = 0) {
    const url = getApiUrl(endpoint);
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      // Handle different response formats
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Check if response is successful
      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
          localStorage.removeItem(API_CONFIG.AUTH_TOKEN_KEY);
          localStorage.removeItem(API_CONFIG.AUTH_USER_KEY);
          window.location.href = '/login';
          throw new Error('Authentication failed. Please login again.');
        }

        // Handle other HTTP errors
        const errorMessage = data?.error?.message || data?.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      // Return data in expected format
      return data?.data || data;

    } catch (error) {
      // Handle network errors and retry logic
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }

      if (retryCount < this.retryAttempts && this.shouldRetry(error)) {
        await this.delay(this.retryDelay * (retryCount + 1));
        return this.request(endpoint, options, retryCount + 1);
      }

      console.error('API request failed:', error);
      throw error;
    }
  }

  // Determine if request should be retried
  shouldRetry(error) {
    // Retry on network errors or 5xx server errors
    return !error.message.includes('4') || error.message.includes('5');
  }

  // Delay helper for retry logic
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const fullEndpoint = queryParams ? `${endpoint}?${queryParams}` : endpoint;
    return this.request(fullEndpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // PATCH request
  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Upload file
  async upload(endpoint, file, onProgress = null) {
    const formData = new FormData();
    formData.append('file', file);

    const config = {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let browser set it
        ...(localStorage.getItem(API_CONFIG.AUTH_TOKEN_KEY) && {
          Authorization: `Bearer ${localStorage.getItem(API_CONFIG.AUTH_TOKEN_KEY)}`
        }),
      },
    };

    if (onProgress) {
      // Add progress tracking if needed
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          onProgress(percentComplete);
        }
      });
    }

    return this.request(endpoint, config);
  }

  // Health check
  async healthCheck() {
    return isApiAvailable();
  }
}

// Create API service instance
const apiService = new ApiService();

// API endpoints using the configuration
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: API_CONFIG.ENDPOINTS.AUTH.LOGIN,
  REGISTER: API_CONFIG.ENDPOINTS.AUTH.REGISTER,
  LOGOUT: API_CONFIG.ENDPOINTS.AUTH.LOGOUT,
  REFRESH_TOKEN: API_CONFIG.ENDPOINTS.AUTH.REFRESH,
  USER_PROFILE: API_CONFIG.ENDPOINTS.AUTH.PROFILE,
  
  // Product endpoints
  PRODUCTS: API_CONFIG.ENDPOINTS.PRODUCTS.LIST,
  PRODUCT_BY_ID: (id) => API_CONFIG.ENDPOINTS.PRODUCTS.DETAIL(id),
  PRODUCTS_BY_CATEGORY: (category) => API_CONFIG.ENDPOINTS.PRODUCTS.CATEGORY(category),
  SEARCH_PRODUCTS: API_CONFIG.ENDPOINTS.PRODUCTS.SEARCH,
  FEATURED_PRODUCTS: API_CONFIG.ENDPOINTS.PRODUCTS.FEATURED,
  BEST_SELLERS: API_CONFIG.ENDPOINTS.PRODUCTS.BEST_SELLERS,
  NEW_ARRIVALS: API_CONFIG.ENDPOINTS.PRODUCTS.NEW_ARRIVALS,
  PRODUCT_RATINGS: (productId) => API_CONFIG.ENDPOINTS.PRODUCTS.RATINGS(productId),
  
  // Cart endpoints
  CART: API_CONFIG.ENDPOINTS.CART.LIST,
  CART_ITEM: (id) => API_CONFIG.ENDPOINTS.CART.UPDATE(id),
  CART_REMOVE: (id) => API_CONFIG.ENDPOINTS.CART.REMOVE(id),
  CART_CLEAR: API_CONFIG.ENDPOINTS.CART.CLEAR,
  CART_SUMMARY: API_CONFIG.ENDPOINTS.CART.SUMMARY,
  CART_COUPON: API_CONFIG.ENDPOINTS.CART.COUPON,
  
  // Wishlist endpoints
  WISHLIST: API_CONFIG.ENDPOINTS.WISHLIST.LIST,
  WISHLIST_ITEM: (id) => API_CONFIG.ENDPOINTS.WISHLIST.REMOVE(id),
  WISHLIST_MOVE_TO_CART: (id) => API_CONFIG.ENDPOINTS.WISHLIST.MOVE_TO_CART(id),
  
  // Order endpoints
  ORDERS: API_CONFIG.ENDPOINTS.ORDERS.LIST,
  ORDER_BY_ID: (id) => API_CONFIG.ENDPOINTS.ORDERS.DETAIL(id),
  CREATE_ORDER: API_CONFIG.ENDPOINTS.ORDERS.CREATE,
  
  // User endpoints
  USER_PROFILE_UPDATE: API_CONFIG.ENDPOINTS.USER.UPDATE,
  USER_ORDERS: API_CONFIG.ENDPOINTS.USER.ORDERS,
  USER_ADDRESSES: API_CONFIG.ENDPOINTS.USER.ADDRESSES,
};

export default apiService; 