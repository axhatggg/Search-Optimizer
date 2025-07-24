import { useState, useEffect } from "react";
import { Filter } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { ProductGrid } from "@/components/ProductGrid";
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

// Extended products data for the products page
const allProducts: Product[] = [
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
    category: "Home",
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
    category: "Sports",
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
    category: "Beauty",
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
    category: "Books",
    isNew: true,
    isSale: false,
  },
  // Additional products for the products page
  {
    id: 9,
    name: "Gaming Mouse - RGB",
    price: 45.99,
    image: headphonesImage, // Using placeholder
    rating: 4.6,
    reviews: 89,
    category: "Electronics",
    isNew: false,
    isSale: false,
  },
  {
    id: 10,
    name: "Casual Denim Jacket",
    price: 59.99,
    originalPrice: 79.99,
    image: tshirtImage, // Using placeholder
    rating: 4.3,
    reviews: 45,
    category: "Clothing",
    isNew: true,
    isSale: true,
  },
];

const Products = () => {
  const [searchParams] = useSearchParams();
  const [products] = useState<Product[]>(allProducts);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(allProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
      handleSearch(searchParam);
    }
  }, [searchParams]);

  const applyFilters = (query: string, filters: FilterState, productList: Product[]) => {
    let filtered = productList;

    if (query.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (filters.categories.length > 0) {
      filtered = filtered.filter(product =>
        filters.categories.includes(product.category)
      );
    }

    filtered = filtered.filter(product =>
      product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );

    if (filters.rating > 0) {
      filtered = filtered.filter(product => product.rating >= filters.rating);
    }

    return filtered;
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsLoading(true);
    
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
        return prev;
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">All Products</h1>
          <p className="text-muted-foreground">Browse our complete collection of products</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
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

          <div className="lg:w-3/4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">
                {searchQuery ? `Search results for "${searchQuery}"` : "All Products"}
              </h2>
              <span className="text-sm text-muted-foreground">
                {filteredProducts.length} products
              </span>
            </div>

            <ProductGrid
              products={filteredProducts}
              onAddToCart={handleAddToCart}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Products;
