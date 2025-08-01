import React, { createContext, useContext, useState } from 'react';

// Import product images
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

// Initial products data
const initialProducts = [
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
  const [products, setProducts] = useState(initialProducts);

  const addProduct = async (productData) => {
    const newProduct = {
      id: products.length + 1,
      ...productData,
      userRatings: [],
      createdAt: new Date(),
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = async (id, productData) => {
    setProducts(prev => prev.map(product => 
      product.id === id ? { ...product, ...productData, updatedAt: new Date() } : product
    ));
  };

  const deleteProduct = async (id) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  const rateProduct = async (productId, rating) => {
    const newRating = {
      userId: `user${Date.now()}`,
      rating,
      timestamp: new Date()
    };

    setProducts(prev => prev.map(product => {
      if (product.id === productId) {
        return {
          ...product,
          userRatings: [...product.userRatings, newRating]
        };
      }
      return product;
    }));
  };

  return (
    <ProductsContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, rateProduct }}>
      {children}
    </ProductsContext.Provider>
  );
}; 