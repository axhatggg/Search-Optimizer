import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '@/components/ProductCard';

// Import product images
import headphonesImage from "@/assets/headphones.jpg";
import tshirtImage from "@/assets/tshirt.jpg";
import securityCameraImage from "@/assets/security-camera.jpg";
import coffeeImage from "@/assets/coffee.jpg";
import yogaMatImage from "@/assets/yoga-mat.jpg";
import faceCreamImage from "@/assets/face-cream.jpg";
import phoneCaseImage from "@/assets/phone-case.jpg";
import bookImage from "@/assets/book.jpg";

// Initial products data
const initialProducts: Product[] = [
  {
    id: 1,
    name: "Wireless Bluetooth Headphones",
    price: 79.99,
    originalPrice: 99.99,
    image: headphonesImage,
    // rating: 4.5,
    // reviews: 128,
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
    // rating: 4.2,
    // reviews: 85,
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
    // rating: 4.7,
    // reviews: 203,
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
    // rating: 4.8,
    // reviews: 156,
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
    // rating: 4.6,
    // reviews: 92,
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
    // rating: 4.3,
    // reviews: 174,
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
    // rating: 4.1,
    // reviews: 67,
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
    // rating: 4.9,
    // reviews: 89,
    category: "Books",
    company: "O'Reilly",
    isNew: true,
    isSale: false,
    userRatings: [
      { userId: "user16", rating: 5, timestamp: new Date() },
      { userId: "user17", rating: 5, timestamp: new Date() },
    ],
  },
];

interface ProductsContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: number, product: Omit<Product, 'id'>) => void;
  deleteProduct: (id: number) => void;
  rateProduct: (productId: number, rating: number) => void;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
};

interface ProductsProviderProps {
  children: ReactNode;
}

export const ProductsProvider: React.FC<ProductsProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: Math.max(...products.map(p => p.id), 0) + 1,
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: number, productData: Omit<Product, 'id'>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...productData, id } : p));
  };

  const deleteProduct = (id: number) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const rateProduct = (productId: number, rating: number) => {
    const currentUserId = "user123"; // In a real app, this would come from auth context
    setProducts(products.map(product => {
      if (product.id === productId) {
        const newRating = {
          userId: currentUserId,
          rating,
          timestamp: new Date()
        };
        return {
          ...product,
          userRatings: [...product.userRatings, newRating]
        };
      }
      return product;
    }));
  };

  return (
    // <ProductsContext.Provider value={{ products, addProduct, updateProduct, deleteProduct }}>
    <ProductsContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, rateProduct }}>
      {children}
    </ProductsContext.Provider>
  );
};