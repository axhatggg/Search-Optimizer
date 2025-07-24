import { useState, useEffect } from "react";
import { Filter, Grid, List } from "lucide-react";
import { Header } from "@/components/Header";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductCarousel } from "@/components/ProductCarousel";
import { HeroImageCarousel } from "@/components/HeroImageCarousel";
import { FilterPanel, FilterState } from "@/components/FilterPanel";
import { Product } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Import product images
import headphonesImage from "@/assets/headphones.jpg";
import tshirtImage from "@/assets/tshirt.jpg";
import securityCameraImage from "@/assets/security-camera.jpg";
import coffeeImage from "@/assets/coffee.jpg";
import yogaMatImage from "@/assets/yoga-mat.jpg";
import faceCreamImage from "@/assets/face-cream.jpg";
import phoneCaseImage from "@/assets/phone-case.jpg";
import bookImage from "@/assets/book.jpg";

// Sample products data
const sampleProducts: Product[] = [
  {
    id: 1,
    name: "Wireless Bluetooth Headphones",
    price: 79.99,
    originalPrice: 99.99,
    image: headphonesImage,
    rating: 4.5,
    reviews: 128,
    category: "Electronics",
    isNew: true,
    isSale: true,
  },
  {
    id: 2,
    name: "Premium Cotton T-Shirt",
    price: 24.99,
    image: tshirtImage,
    rating: 4.2,
    reviews: 85,
    category: "Clothing",
    isNew: false,
    isSale: false,
  },
  {
    id: 3,
    name: "Smart Home Security Camera",
    price: 149.99,
    originalPrice: 199.99,
    image: securityCameraImage,
    rating: 4.7,
    reviews: 203,
    category: "Electronics",
    isNew: true,
    isSale: true,
  },
  {
    id: 4,
    name: "Organic Coffee Beans - 1lb",
    price: 16.99,
    image: coffeeImage,
    rating: 4.8,
    reviews: 156,
    category: "Food & Beverages",
    isNew: false,
    isSale: false,
  },
  {
    id: 5,
    name: "Yoga Mat - Extra Thick",
    price: 39.99,
    originalPrice: 59.99,
    image: yogaMatImage,
    rating: 4.4,
    reviews: 92,
    category: "Sports & Fitness",
    isNew: false,
    isSale: true,
  },
  {
    id: 6,
    name: "Moisturizing Face Cream",
    price: 32.99,
    image: faceCreamImage,
    rating: 4.6,
    reviews: 174,
    category: "Beauty & Health",
    isNew: true,
    isSale: false,
  },
  {
    id: 7,
    name: "Smartphone Case - Clear",
    price: 19.99,
    originalPrice: 29.99,
    image: phoneCaseImage,
    rating: 4.3,
    reviews: 67,
    category: "Electronics",
    isNew: false,
    isSale: true,
  },
  {
    id: 8,
    name: "Bestselling Novel Book",
    price: 14.99,
    image: bookImage,
    rating: 4.9,
    reviews: 312,
    category: "Books & Media",
    isNew: true,
    isSale: false,
  },
  // Additional products for variety
  {
    id: 9,
    name: "Gaming Mechanical Keyboard",
    price: 89.99,
    originalPrice: 119.99,
    image: headphonesImage, // Using existing image as placeholder
    rating: 4.6,
    reviews: 245,
    category: "Electronics",
    isNew: true,
    isSale: true,
  },
  {
    id: 10,
    name: "Leather Business Bag",
    price: 129.99,
    image: phoneCaseImage, // Using existing image as placeholder
    rating: 4.4,
    reviews: 89,
    category: "Fashion & Accessories",
    isNew: false,
    isSale: false,
  },
  {
    id: 11,
    name: "Stainless Steel Water Bottle",
    price: 24.99,
    originalPrice: 34.99,
    image: coffeeImage, // Using existing image as placeholder
    rating: 4.7,
    reviews: 156,
    category: "Sports & Fitness",
    isNew: false,
    isSale: true,
  },
  {
    id: 12,
    name: "Wireless Phone Charger",
    price: 29.99,
    image: securityCameraImage, // Using existing image as placeholder
    rating: 4.3,
    reviews: 78,
    category: "Electronics",
    isNew: true,
    isSale: false,
  },
  {
    id: 13,
    name: "Organic Green Tea Set",
    price: 22.99,
    originalPrice: 29.99,
    image: faceCreamImage, // Using existing image as placeholder
    rating: 4.8,
    reviews: 134,
    category: "Food & Beverages",
    isNew: false,
    isSale: true,
  },
  {
    id: 14,
    name: "Running Shoes - Men's",
    price: 79.99,
    image: yogaMatImage, // Using existing image as placeholder
    rating: 4.5,
    reviews: 298,
    category: "Sports & Fitness",
    isNew: true,
    isSale: false,
  },
  {
    id: 15,
    name: "Art Supplies Kit",
    price: 34.99,
    originalPrice: 49.99,
    image: bookImage, // Using existing image as placeholder
    rating: 4.6,
    reviews: 112,
    category: "Arts & Crafts",
    isNew: false,
    isSale: true,
  },
  {
    id: 16,
    name: "Smart Watch - Fitness Tracker",
    price: 199.99,
    originalPrice: 249.99,
    image: headphonesImage, // Using existing image as placeholder
    rating: 4.4,
    reviews: 567,
    category: "Electronics",
    isNew: true,
    isSale: true,
  },
];

const Index = () => {
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(sampleProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Get featured products (new and sale items)
  const featuredProducts = products.filter(p => p.isNew || p.isSale);
  const bestSellers = products.filter(p => p.reviews > 100).sort((a, b) => b.reviews - a.reviews);
  const electronicsProducts = products.filter(p => p.category === "Electronics");

  // Filter products based on search query and filters
  const applyFilters = (query: string, filters: FilterState, productList: Product[]) => {
    let filtered = productList;

    // Search filter
    if (query.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(product =>
        filters.categories.includes(product.category)
      );
    }

    // Price filter
    filtered = filtered.filter(product =>
      product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );

    // Rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(product => product.rating >= filters.rating);
    }

    return filtered;
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const filtered = applyFilters(query, {
        categories: [],
        priceRange: [0, 1000],
        rating: 0,
        inStock: false,
      }, products);
      setFilteredProducts(filtered);
      setIsLoading(false);
    }, 300);
  };

  const handleFilterChange = (filters: FilterState) => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const filtered = applyFilters(searchQuery, filters, products);
      setFilteredProducts(filtered);
      setIsLoading(false);
    }, 200);
  };

  const handleAddToCart = (product: Product) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev; // Don't add duplicate
      }
      return [...prev, product];
    });
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={handleSearch} cartCount={cartItems.length} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center py-12 mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
            Discover Amazing Products
          </h1>
          <p className="text-xl text-muted-foreground mb-8 animate-fade-in">
            Shop from thousands of products with fast delivery and great prices
          </p>
          <div className="flex justify-center gap-4 animate-slide-up">
            <Button size="lg" className="h-12 px-8">
              Shop Now
            </Button>
            <Button variant="outline" size="lg" className="h-12 px-8">
              Learn More
            </Button>
          </div>
        </section>

        {/* Hero Image Carousel */}
        <HeroImageCarousel />

        {/* Best Sellers Carousel */}
        <section className="mb-12">
          <ProductCarousel
            products={bestSellers}
            title="⭐ Best Sellers"
            onAddToCart={handleAddToCart}
          />
        </section>

        {/* Electronics Carousel */}
        <section className="mb-12">
          <ProductCarousel
            products={electronicsProducts}
            title="📱 Latest Electronics"
            onAddToCart={handleAddToCart}
          />
        </section>

        {/* Products Section */}
        <section>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="lg:w-1/4">
              <div className="lg:hidden mb-4">
                <Button
                  variant="outline"
                  onClick={() => setIsFilterVisible(!isFilterVisible)}
                  className="w-full"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {isFilterVisible ? "Hide" : "Show"} Filters
                </Button>
              </div>
              
              <div className={`${isFilterVisible ? "block" : "hidden"} lg:block`}>
                <FilterPanel
                  onFilterChange={handleFilterChange}
                  isVisible={true}
                  onToggle={() => setIsFilterVisible(false)}
                />
              </div>
            </div>

            {/* Products Grid */}
            <div className="lg:w-3/4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">
                  {searchQuery ? `Search results for "${searchQuery}"` : "All Products"}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {filteredProducts.length} products
                  </span>
                  <Button variant="ghost" size="icon">
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <ProductGrid
                products={filteredProducts}
                onAddToCart={handleAddToCart}
                isLoading={isLoading}
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted/30 mt-16 py-8 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 Cartella. All rights reserved.</p>
          <p>Search Optimiser</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
