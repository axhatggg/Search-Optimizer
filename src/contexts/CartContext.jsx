import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartService } from '@/services/cartService';

const CartContext = createContext(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load cart and wishlist on mount
  useEffect(() => {
    loadCart();
    loadWishlist();
  }, []);

  const loadCart = async () => {
    setLoading(true);
    try {
      const response = await cartService.getCart();
      setCartItems(response.items || response || []);
    } catch (error) {
      console.warn('Cart API not available, using local state:', error);
      // Keep existing local cart items
    } finally {
      setLoading(false);
    }
  };

  const loadWishlist = async () => {
    try {
      const response = await cartService.getWishlist();
      setWishlistItems(response.items || response || []);
    } catch (error) {
      console.warn('Wishlist API not available, using local state:', error);
      // Keep existing local wishlist items
    }
  };

  const addToCart = async (product, quantity = 1) => {
    try {
      const response = await cartService.addToCart(product.id, quantity);
      await loadCart(); // Reload cart from API
      return response;
    } catch (error) {
      console.warn('Add to cart API failed, using local state:', error);
      // Fallback to local state
      const existingItem = cartItems.find(item => item.id === product.id);
      if (existingItem) {
        setCartItems(prev => prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ));
      } else {
        setCartItems(prev => [...prev, { ...product, quantity, addedAt: new Date() }]);
      }
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await cartService.removeFromCart(productId);
      await loadCart(); // Reload cart from API
      return response;
    } catch (error) {
      console.warn('Remove from cart API failed, using local state:', error);
      // Fallback to local state
      setCartItems(prev => prev.filter(item => item.id !== productId));
    }
  };

  const updateCartItemQuantity = async (productId, quantity) => {
    try {
      const response = await cartService.updateCartItem(productId, quantity);
      await loadCart(); // Reload cart from API
      return response;
    } catch (error) {
      console.warn('Update cart item API failed, using local state:', error);
      // Fallback to local state
      setCartItems(prev => prev.map(item => 
        item.id === productId 
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const clearCart = async () => {
    try {
      const response = await cartService.clearCart();
      setCartItems([]);
      return response;
    } catch (error) {
      console.warn('Clear cart API failed, using local state:', error);
      // Fallback to local state
      setCartItems([]);
    }
  };

  const addToWishlist = async (product) => {
    try {
      const response = await cartService.addToWishlist(product.id);
      await loadWishlist(); // Reload wishlist from API
      return response;
    } catch (error) {
      console.warn('Add to wishlist API failed, using local state:', error);
      // Fallback to local state
      const existing = wishlistItems.find(item => item.id === product.id);
      if (!existing) {
        setWishlistItems(prev => [...prev, { ...product, addedAt: new Date() }]);
      }
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const response = await cartService.removeFromWishlist(productId);
      await loadWishlist(); // Reload wishlist from API
      return response;
    } catch (error) {
      console.warn('Remove from wishlist API failed, using local state:', error);
      // Fallback to local state
      setWishlistItems(prev => prev.filter(item => item.id !== productId));
    }
  };

  const moveToCart = async (productId) => {
    try {
      const response = await cartService.moveToCart(productId);
      await loadCart();
      await loadWishlist();
      return response;
    } catch (error) {
      console.warn('Move to cart API failed, using local state:', error);
      // Fallback to local state
      const wishlistItem = wishlistItems.find(item => item.id === productId);
      if (wishlistItem) {
        addToCart(wishlistItem);
        removeFromWishlist(productId);
      }
    }
  };

  const isInCart = (productId) => {
    return cartItems.some(item => item.id === productId);
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      wishlistItems,
      loading,
      error,
      addToCart,
      removeFromCart,
      updateCartItemQuantity,
      clearCart,
      addToWishlist,
      removeFromWishlist,
      moveToCart,
      isInCart,
      isInWishlist,
      getCartCount,
      getCartTotal,
      loadCart,
      loadWishlist,
    }}>
      {children}
    </CartContext.Provider>
  );
}; 