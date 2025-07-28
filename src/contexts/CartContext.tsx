import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product } from '@/components/ProductCard';
import { db } from '@/integrations/firebase/config';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, where, updateDoc, getDocs } from 'firebase/firestore';
import { useAuth } from './AuthContext';

interface CartItem extends Product {
  quantity: number;
  addedAt: Date;
}

interface CartContextType {
  cartItems: CartItem[];
  wishlistItems: Product[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: number) => void;
  isInCart: (productId: number) => boolean;
  isInWishlist: (productId: number) => boolean;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);

  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setCartItems([]);
      setWishlistItems([]);
      return;
    }

    // Subscribe to cart items
    const cartQuery = query(collection(db, 'cart'), where('userId', '==', user.uid));
    const unsubscribeCart = onSnapshot(cartQuery, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        ...doc.data(),
        firestoreId: doc.id
      })) as (CartItem & { firestoreId: string })[];
      setCartItems(items);
    });

    // Subscribe to wishlist items
    const wishlistQuery = query(collection(db, 'wishlist'), where('userId', '==', user.uid));
    const unsubscribeWishlist = onSnapshot(wishlistQuery, (snapshot) => {
      const items = snapshot.docs.map(doc => doc.data()) as Product[];
      setWishlistItems(items);
    });

    return () => {
      unsubscribeCart();
      unsubscribeWishlist();
    };
  }, [user]);

  const addToCart = async (product: Product) => {
    if (!user) return;

    const existingItem = cartItems.find(item => item.id === product.id);
    if (existingItem) {
      // Update quantity
      const cartRef = doc(db, 'cart', (existingItem as any).firestoreId);
      await updateDoc(cartRef, {
        quantity: existingItem.quantity + 1
      });
    } else {
      // Add new item
      await addDoc(collection(db, 'cart'), {
        ...product,
        quantity: 1,
        addedAt: new Date(),
        userId: user.uid
      });
    }
  };

  const removeFromCart = async (productId: number) => {
    if (!user) return;

    const item = cartItems.find(item => item.id === productId);
    if (item) {
      await deleteDoc(doc(db, 'cart', (item as any).firestoreId));
    }
  };

  const addToWishlist = async (product: Product) => {
    if (!user) return;

    const existing = wishlistItems.find(item => item.id === product.id);
    if (!existing) {
      await addDoc(collection(db, 'wishlist'), {
        ...product,
        userId: user.uid,
        addedAt: new Date()
      });
    }
  };

  const removeFromWishlist = async (productId: number) => {
    if (!user) return;

    const wishlistQuery = query(
      collection(db, 'wishlist'), 
      where('userId', '==', user.uid),
      where('id', '==', productId)
    );
    
    const snapshot = await getDocs(wishlistQuery);
    snapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });
  };

  const isInCart = (productId: number) => {
    return cartItems.some(item => item.id === productId);
  };

  const isInWishlist = (productId: number) => {
    return wishlistItems.some(item => item.id === productId);
  };

  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      wishlistItems,
      addToCart,
      removeFromCart,
      addToWishlist,
      removeFromWishlist,
      isInCart,
      isInWishlist,
      getCartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};