import { useState, useEffect } from "react";
import { Filter, Grid, List } from "lucide-react";
import { Header } from "@/components/Header";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductCarousel } from "@/components/ProductCarousel";
import { HeroImageCarousel } from "@/components/HeroImageCarousel";
import { FilterPanel } from "@/components/FilterPanel";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useProducts } from "@/contexts/ProductsContext";
import { useCart } from "@/contexts/CartContext";

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
import artsupplykitImage from "@/assets/artsupplykitImage.jpeg"
import keyboardImage from "@/assets/keyboardImage.jpeg"
import leatherbagImage from "@/assets/leatherbagImage.jpeg"
import stainlessbottleImage from "@/assets/stainlessbottleImage.jpeg"
import wirelessphonechargerImage from "@/assets/wirelessphonechargerImage.jpeg"
import greenteasetImage from "@/assets/greenteasetImage.webp"
import runningshoesImage from "@/assets/runningshoesImage.webp"

const Index = () => {
  const { products, rateProduct } = useProducts();
  const { addToCart, getCartCount } = useCart();
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  // Get featured products (new and sale items)
  const featuredProducts = products.filter(p => p.isNew || p.isSale);
  const bestSellers = products.filter(p => p.userRatings.length > 2).sort((a, b) => b.userRatings.length - a.userRatings.length);
  const electronicsProducts = products.filter(p => p.category === "Electronics");

  // Filter products based on search query and filters
  const applyFilters = (query, filters, productList) => {
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

  const handleFilterChange = (filters) => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const filtered = applyFilters(searchQuery, filters, products);
      setFilteredProducts(filtered);
      setIsLoading(false);
    }, 200);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={handleSearch} cartCount={getCartCount()} />
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
                onRate={(productId, rating) => {
                  rateProduct(productId, rating);
                  toast({
                    title: "Rating submitted",
                    description: "Thank you for rating this product!",
                  });
                }}
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