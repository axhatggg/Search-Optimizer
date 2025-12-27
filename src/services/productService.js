import apiService, { API_ENDPOINTS } from './api.js';

export const productService = {
  // Get all products
  async getProducts(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const endpoint = queryParams ? `${API_ENDPOINTS.PRODUCTS}?${queryParams}` : API_ENDPOINTS.PRODUCTS;
      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      console.error('Get products failed:', error);
      throw error;
    }
  },

  // Get product by ID
  async getProductById(id) {
    try {
      const response = await apiService.get(API_ENDPOINTS.PRODUCT_BY_ID(id));
      return response;
    } catch (error) {
      console.error('Get product by ID failed:', error);
      throw error;
    }
  },

  // Get products by category
  async getProductsByCategory(category, params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const endpoint = queryParams 
        ? `${API_ENDPOINTS.PRODUCTS_BY_CATEGORY(category)}?${queryParams}` 
        : API_ENDPOINTS.PRODUCTS_BY_CATEGORY(category);
      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      console.error('Get products by category failed:', error);
      throw error;
    }
  },

  // Search products
  async searchProducts(query, params = {}) {
    try {
      const searchParams = { q: query, ...params };
      const queryParams = new URLSearchParams(searchParams).toString();
      const endpoint = `${API_ENDPOINTS.SEARCH_PRODUCTS}?${queryParams}`;
      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      console.error('Search products failed:', error);
      throw error;
    }
  },

  // Add product (admin only)
  async addProduct(productData) {
    try {
      const response = await apiService.post(API_ENDPOINTS.PRODUCTS, productData);
      return response;
    } catch (error) {
      console.error('Add product failed:', error);
      throw error;
    }
  },

  // Update product (admin only)
  async updateProduct(id, productData) {
    try {
      const response = await apiService.put(API_ENDPOINTS.PRODUCT_BY_ID(id), productData);
      return response;
    } catch (error) {
      console.error('Update product failed:', error);
      throw error;
    }
  },

  // Delete product (admin only)
  async deleteProduct(id) {
    try {
      const response = await apiService.delete(API_ENDPOINTS.PRODUCT_BY_ID(id));
      return response;
    } catch (error) {
      console.error('Delete product failed:', error);
      throw error;
    }
  },

  // Get product ratings
  async getProductRatings(productId) {
    try {
      const response = await apiService.get(API_ENDPOINTS.PRODUCT_RATINGS(productId));
      return response;
    } catch (error) {
      console.error('Get product ratings failed:', error);
      throw error;
    }
  },

  // Add product rating
  async addProductRating(productId, ratingData) {
    try {
      const response = await apiService.post(API_ENDPOINTS.ADD_RATING(productId), ratingData);
      return response;
    } catch (error) {
      console.error('Add product rating failed:', error);
      throw error;
    }
  },

  // Get featured products
  async getFeaturedProducts() {
    try {
      const response = await apiService.get(`${API_ENDPOINTS.PRODUCTS}?featured=true`);
      return response;
    } catch (error) {
      console.error('Get featured products failed:', error);
      throw error;
    }
  },

  // Get best sellers
  async getBestSellers() {
    try {
      const response = await apiService.get(`${API_ENDPOINTS.PRODUCTS}?sort=rating&order=desc&limit=10`);
      return response;
    } catch (error) {
      console.error('Get best sellers failed:', error);
      throw error;
    }
  },

  // Get new arrivals
  async getNewArrivals() {
    try {
      const response = await apiService.get(`${API_ENDPOINTS.PRODUCTS}?sort=createdAt&order=desc&limit=10`);
      return response;
    } catch (error) {
      console.error('Get new arrivals failed:', error);
      throw error;
    }
  },
}; 