// API Configuration
export const API_CONFIG = {
  // Base URL - Change this to your backend API URL
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  
  // Timeout for API requests (in milliseconds)
  TIMEOUT: 10000,
  
  // Retry configuration
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  
  // Authentication
  AUTH_TOKEN_KEY: 'authToken',
  AUTH_USER_KEY: 'user',
  
  // API endpoints
  ENDPOINTS: {
    // Auth
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      PROFILE: '/auth/profile',
    },
    
    // Products
    PRODUCTS: {
      LIST: '/products',
      DETAIL: (id) => `/products/${id}`,
      SEARCH: '/products/search',
      CATEGORY: (category) => `/products/category/${category}`,
      FEATURED: '/products/featured',
      BEST_SELLERS: '/products/best-sellers',
      NEW_ARRIVALS: '/products/new-arrivals',
      RATINGS: (productId) => `/products/${productId}/ratings`,
    },
    
    // Cart
    CART: {
      LIST: '/cart',
      ADD: '/cart',
      UPDATE: (id) => `/cart/${id}`,
      REMOVE: (id) => `/cart/${id}`,
      CLEAR: '/cart',
      SUMMARY: '/cart/summary',
      COUPON: '/cart/coupon',
    },
    
    // Wishlist
    WISHLIST: {
      LIST: '/wishlist',
      ADD: '/wishlist',
      REMOVE: (id) => `/wishlist/${id}`,
      MOVE_TO_CART: (id) => `/wishlist/${id}/move-to-cart`,
    },
    
    // Orders
    ORDERS: {
      LIST: '/orders',
      CREATE: '/orders',
      DETAIL: (id) => `/orders/${id}`,
      UPDATE: (id) => `/orders/${id}`,
    },
    
    // User
    USER: {
      PROFILE: '/user/profile',
      UPDATE: '/user/profile',
      ORDERS: '/user/orders',
      ADDRESSES: '/user/addresses',
    },
  },
  
  // Response status codes
  STATUS_CODES: {
    SUCCESS: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
  },
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to check if API is available
export const isApiAvailable = async () => {
  try {
    const response = await fetch(getApiUrl('/health'), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.warn('API health check failed:', error);
    return false;
  }
}; 