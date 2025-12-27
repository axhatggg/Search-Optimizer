import { useState, useEffect } from "react";
import { Filter } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { ProductGrid } from "@/components/ProductGrid";
import { FilterPanel } from "@/components/FilterPanel";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useProducts } from "@/contexts/ProductsContext";

// Import product images
import headphonesImage from "@/assets/headphones.jpg";
import tshirtImage from "@/assets/tshirt.jpg";
import securityCameraImage from "@/assets/security-camera.jpg";
import coffeeImage from "@/assets/coffee.jpg";
import yogaMatImage from "@/assets/yoga-mat.jpg";
import faceCreamImage from "@/assets/face-cream.jpg";
import phoneCaseImage from "@/assets/phone-case.jpg";
import bookImage from "@/assets/book.jpg";
import gamingmouseImage from "@/assets/gamingmouseImage.jpeg";
import denimjacketImage from "@/assets/denimjacketImage.jpeg";

const Products = () => {
  const { products, rateProduct } = useProducts();
  const { addToCart, getCartCount } = useCart();
  const [searchParams] = useSearchParams();
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
      handleSearch(searchParam);
    }
  }, [searchParams]);

  const applyFilters = (query, filters, productList) => {
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
      filtered = filtered.filter(product => {
        const averageRating = product.userRatings.length > 0 
          ? product.userRatings.reduce((sum, r) => sum + r.rating, 0) / product.userRatings.length 
          : 0;
        return averageRating >= filters.rating;
      });
    }

    return filtered;
  };

  const handleSearch = (query) => {
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

  const handleFilterChange = (filters) => {
    setIsLoading(true);
    
    setTimeout(() => {
      const filtered = applyFilters(searchQuery, filters, products);
      setFilteredProducts(filtered);
      setIsLoading(false);
    }, 200);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    setMessage(`${product.name} has been added to your cart.`);
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header onSearch={handleSearch} cartCount={getCartCount()} />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">All Products</h1>
          <p className="text-gray-600 dark:text-gray-400">Browse our complete collection of products</p>
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
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {searchQuery ? `Search results for "${searchQuery}"` : "All Products"}
              </h2>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {filteredProducts.length} products
              </span>
            </div>

            {message && (
              <div className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded mb-4">
                {message}
              </div>
            )}

            <ProductGrid
              products={filteredProducts}
              onAddToCart={handleAddToCart}
              onRate={(productId, rating) => {
                rateProduct(productId, rating);
                setMessage("Thank you for rating this product!");
                setTimeout(() => setMessage(""), 3000);
              }}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Products; 