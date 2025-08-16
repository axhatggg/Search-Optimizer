import apiService, { API_ENDPOINTS } from './api.js';

export const cartService = {
  // Get user's cart
  async getCart() {
    try {
      const response = await apiService.get(API_ENDPOINTS.CART);
      return response;
    } catch (error) {
      console.error('Get cart failed:', error);
      throw error;
    }
  },

  // Add item to cart
  async addToCart(productId, quantity = 1) {
    try {
      const response = await apiService.post(API_ENDPOINTS.CART, {
        productId,
        quantity,
      });
      return response;
    } catch (error) {
      console.error('Add to cart failed:', error);
      throw error;
    }
  },

  // Update cart item quantity
  async updateCartItem(itemId, quantity) {
    try {
      const response = await apiService.put(API_ENDPOINTS.CART_ITEM(itemId), {
        quantity,
      });
      return response;
    } catch (error) {
      console.error('Update cart item failed:', error);
      throw error;
    }
  },

  // Remove item from cart
  async removeFromCart(itemId) {
    try {
      const response = await apiService.delete(API_ENDPOINTS.CART_ITEM(itemId));
      return response;
    } catch (error) {
      console.error('Remove from cart failed:', error);
      throw error;
    }
  },

  // Clear entire cart
  async clearCart() {
    try {
      const response = await apiService.delete(API_ENDPOINTS.CART);
      return response;
    } catch (error) {
      console.error('Clear cart failed:', error);
      throw error;
    }
  },

  // Get user's wishlist
  async getWishlist() {
    try {
      const response = await apiService.get(API_ENDPOINTS.WISHLIST);
      return response;
    } catch (error) {
      console.error('Get wishlist failed:', error);
      throw error;
    }
  },

  // Add item to wishlist
  async addToWishlist(productId) {
    try {
      const response = await apiService.post(API_ENDPOINTS.WISHLIST, {
        productId,
      });
      return response;
    } catch (error) {
      console.error('Add to wishlist failed:', error);
      throw error;
    }
  },

  // Remove item from wishlist
  async removeFromWishlist(itemId) {
    try {
      const response = await apiService.delete(API_ENDPOINTS.WISHLIST_ITEM(itemId));
      return response;
    } catch (error) {
      console.error('Remove from wishlist failed:', error);
      throw error;
    }
  },

  // Move item from wishlist to cart
  async moveToCart(itemId) {
    try {
      const response = await apiService.post(`${API_ENDPOINTS.WISHLIST_ITEM(itemId)}/move-to-cart`);
      return response;
    } catch (error) {
      console.error('Move to cart failed:', error);
      throw error;
    }
  },

  // Get cart summary (count, total, etc.)
  async getCartSummary() {
    try {
      const response = await apiService.get(`${API_ENDPOINTS.CART}/summary`);
      return response;
    } catch (error) {
      console.error('Get cart summary failed:', error);
      throw error;
    }
  },

  // Apply coupon code
  async applyCoupon(couponCode) {
    try {
      const response = await apiService.post(`${API_ENDPOINTS.CART}/apply-coupon`, {
        couponCode,
      });
      return response;
    } catch (error) {
      console.error('Apply coupon failed:', error);
      throw error;
    }
  },

  // Remove coupon
  async removeCoupon() {
    try {
      const response = await apiService.delete(`${API_ENDPOINTS.CART}/coupon`);
      return response;
    } catch (error) {
      console.error('Remove coupon failed:', error);
      throw error;
    }
  },
}; 