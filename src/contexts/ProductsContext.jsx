import React, { createContext, useContext, useState, useEffect } from 'react';
import { productService } from '@/services/productService';

// Import product images for fallback
import headphonesImage from "@/assets/headphones.jpg";
import tshirtImage from "@/assets/tshirt.jpg";
import securityCameraImage from "@/assets/security-camera.jpg";
import coffeeImage from "@/assets/coffee.jpg";
import yogaMatImage from "@/assets/yoga-mat.jpg";
import faceCreamImage from "@/assets/face-cream.jpg";
import phoneCaseImage from "@/assets/phone-case.jpg";
import bookImage from "@/assets/book.jpg";
import smartwatchImage from "@/assets/smartwatchImage.jpeg";
import artsupplykitImage from "@/assets/artsupplykitImage.jpeg";
import keyboardImage from "@/assets/keyboardImage.jpeg";
import leatherbagImage from "@/assets/leatherbagImage.jpeg";
import stainlessbottleImage from "@/assets/stainlessbottleImage.jpeg";
import wirelessphonechargerImage from "@/assets/wirelessphonechargerImage.jpeg";
import greenteasetImage from "@/assets/greenteasetImage.webp";
import runningshoesImage from "@/assets/runningshoesImage.webp";

// Fallback products data
const fallbackProducts = [
  {
    id: 1,
    name: "Wireless Bluetooth Headphones",
    price: 79.99,
    originalPrice: 99.99,
    image: headphonesImage,
    category: "Electronics",
    company: "Sony",
    isNew: true,
    isSale: true,
    userRatings: [
      { userId: "user1", rating: 5, timestamp: new Date() },
      { userId: "user2", rating: 4, timestamp: new Date() },
      { userId: "user3", rating: 5, timestamp: new Date() },
    ],
  },
  {
    id: 2,
    name: "Premium Cotton T-Shirt",
    price: 24.99,
    image: tshirtImage,
    category: "Clothing",
    company: "Nike",
    gender: "Unisex",
    isNew: false,
    isSale: false,
    userRatings: [
      { userId: "user4", rating: 4, timestamp: new Date() },
      { userId: "user5", rating: 4, timestamp: new Date() },
    ],
  },
  {
    id: 3,
    name: "Smart Home Security Camera",
    price: 149.99,
    originalPrice: 199.99,
    image: securityCameraImage,
    category: "Electronics",
    company: "Ring",
    isNew: true,
    isSale: true,
    userRatings: [
      { userId: "user6", rating: 5, timestamp: new Date() },
      { userId: "user7", rating: 5, timestamp: new Date() },
      { userId: "user8", rating: 4, timestamp: new Date() },
    ],
  },
  {
    id: 4,
    name: "Organic Coffee Beans - 1lb",
    price: 16.99,
    image: coffeeImage,
    category: "Home",
    company: "Starbucks",
    isNew: false,
    isSale: false,
    userRatings: [
      { userId: "user9", rating: 5, timestamp: new Date() },
      { userId: "user10", rating: 5, timestamp: new Date() },
    ],
  },
  {
    id: 5,
    name: "Eco-Friendly Yoga Mat",
    price: 39.99,
    originalPrice: 49.99,
    image: yogaMatImage,
    category: "Sports",
    company: "Lululemon",
    isNew: true,
    isSale: true,
    userRatings: [
      { userId: "user11", rating: 5, timestamp: new Date() },
      { userId: "user12", rating: 4, timestamp: new Date() },
    ],
  },
  {
    id: 6,
    name: "Anti-Aging Face Cream",
    price: 54.99,
    image: faceCreamImage,
    category: "Beauty",
    company: "Olay",
    isNew: false,
    isSale: false,
    userRatings: [
      { userId: "user13", rating: 4, timestamp: new Date() },
      { userId: "user14", rating: 4, timestamp: new Date() },
    ],
  },
  {
    id: 7,
    name: "Protective Phone Case",
    price: 19.99,
    originalPrice: 29.99,
    image: phoneCaseImage,
    category: "Electronics",
    company: "OtterBox",
    isNew: false,
    isSale: true,
    userRatings: [
      { userId: "user15", rating: 4, timestamp: new Date() },
    ],
  },
  {
    id: 8,
    name: "The Psychology of Programming",
    price: 32.99,
    image: bookImage,
    category: "Books",
    company: "O'Reilly",
    isNew: true,
    isSale: false,
    userRatings: [
      { userId: "user16", rating: 5, timestamp: new Date() },
      { userId: "user17", rating: 5, timestamp: new Date() },
    ],
  },
  {
    id: 9,
    name: "Smart Fitness Watch",
    price: 199.99,
    originalPrice: 249.99,
    image: smartwatchImage,
    category: "Electronics",
    company: "Apple",
    isNew: true,
    isSale: true,
    userRatings: [
      { userId: "user18", rating: 5, timestamp: new Date() },
      { userId: "user19", rating: 5, timestamp: new Date() },
    ],
  },
  {
    id: 10,
    name: "Professional Art Supply Kit",
    price: 89.99,
    image: artsupplykitImage,
    category: "Arts",
    company: "Crayola",
    isNew: true,
    isSale: false,
    userRatings: [
      { userId: "user20", rating: 4, timestamp: new Date() },
    ],
  },
  {
    id: 11,
    name: "Mechanical Gaming Keyboard",
    price: 129.99,
    originalPrice: 159.99,
    image: keyboardImage,
    category: "Electronics",
    company: "Razer",
    isNew: false,
    isSale: true,
    userRatings: [
      { userId: "user21", rating: 5, timestamp: new Date() },
      { userId: "user22", rating: 4, timestamp: new Date() },
    ],
  },
  {
    id: 12,
    name: "Premium Leather Handbag",
    price: 299.99,
    image: leatherbagImage,
    category: "Fashion",
    company: "Coach",
    isNew: false,
    isSale: false,
    userRatings: [
      { userId: "user23", rating: 5, timestamp: new Date() },
    ],
  },
  {
    id: 13,
    name: "Stainless Steel Water Bottle",
    price: 34.99,
    image: stainlessbottleImage,
    category: "Home",
    company: "Hydro Flask",
    isNew: false,
    isSale: false,
    userRatings: [
      { userId: "user24", rating: 4, timestamp: new Date() },
    ],
  },
  {
    id: 14,
    name: "Wireless Phone Charger",
    price: 49.99,
    originalPrice: 69.99,
    image: wirelessphonechargerImage,
    category: "Electronics",
    company: "Samsung",
    isNew: false,
    isSale: true,
    userRatings: [
      { userId: "user25", rating: 4, timestamp: new Date() },
    ],
  },
  {
    id: 15,
    name: "Organic Green Tea Set",
    price: 44.99,
    image: greenteasetImage,
    category: "Home",
    company: "Teavana",
    isNew: true,
    isSale: false,
    userRatings: [
      { userId: "user26", rating: 5, timestamp: new Date() },
    ],
  },
  {
    id: 16,
    name: "Professional Running Shoes",
    price: 129.99,
    originalPrice: 149.99,
    image: runningshoesImage,
    category: "Sports",
    company: "Adidas",
    isNew: false,
    isSale: true,
    userRatings: [
      { userId: "user27", rating: 5, timestamp: new Date() },
      { userId: "user28", rating: 4, timestamp: new Date() },
    ],
  },
];

const ProductsContext = createContext(undefined);

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
};

export const ProductsProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await productService.getProducts();
      setProducts(response.products || response || []);
    } catch (error) {
      console.warn('API not available, using fallback data:', error);
      setProducts(fallbackProducts);
      setError('Using offline data - API not available');
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async (query, filters = {}) => {
    setLoading(true);
    try {
      const response = await productService.searchProducts(query, filters);
      return response.products || response || [];
    } catch (error) {
      console.warn('Search API not available, filtering locally:', error);
      // Fallback to local filtering
      return products.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
      );
    } finally {
      setLoading(false);
    }
  };

  const getProductsByCategory = async (category) => {
    setLoading(true);
    try {
      const response = await productService.getProductsByCategory(category);
      return response.products || response || [];
    } catch (error) {
      console.warn('Category API not available, filtering locally:', error);
      // Fallback to local filtering
      return products.filter(product => product.category === category);
    } finally {
      setLoading(false);
    }
  };

  const getFeaturedProducts = async () => {
    try {
      const response = await productService.getFeaturedProducts();
      return response.products || response || [];
    } catch (error) {
      console.warn('Featured products API not available, using local data:', error);
      return products.filter(p => p.isNew || p.isSale);
    }
  };

  const getBestSellers = async () => {
    try {
      const response = await productService.getBestSellers();
      return response.products || response || [];
    } catch (error) {
      console.warn('Best sellers API not available, using local data:', error);
      return products.filter(p => p.userRatings.length > 2)
        .sort((a, b) => b.userRatings.length - a.userRatings.length);
    }
  };

  const addProduct = async (productData) => {
    try {
      const response = await productService.addProduct(productData);
      await loadProducts(); // Reload products
      return response;
    } catch (error) {
      console.error('Add product failed:', error);
      throw error;
    }
  };

  const updateProduct = async (id, productData) => {
    try {
      const response = await productService.updateProduct(id, productData);
      await loadProducts(); // Reload products
      return response;
    } catch (error) {
      console.error('Update product failed:', error);
      throw error;
    }
  };

  const deleteProduct = async (id) => {
    try {
      const response = await productService.deleteProduct(id);
      await loadProducts(); // Reload products
      return response;
    } catch (error) {
      console.error('Delete product failed:', error);
      throw error;
    }
  };

  const rateProduct = async (productId, rating) => {
    try {
      const response = await productService.addProductRating(productId, { rating });
      await loadProducts(); // Reload products to get updated ratings
      return response;
    } catch (error) {
      console.error('Rate product failed:', error);
      throw error;
    }
  };

  return (
    <ProductsContext.Provider value={{ 
      products, 
      loading, 
      error,
      loadProducts,
      searchProducts,
      getProductsByCategory,
      getFeaturedProducts,
      getBestSellers,
      addProduct, 
      updateProduct, 
      deleteProduct, 
      rateProduct 
    }}>
      {children}
    </ProductsContext.Provider>
  );
}; 