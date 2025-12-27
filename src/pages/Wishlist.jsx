import { useState } from "react";
import { Header } from "@/components/Header";
import { useCart } from "@/contexts/CartContext";
import { useProducts } from "@/contexts/ProductsContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserRating } from "@/components/UserRating";
import { Trash2, ShoppingCart } from "lucide-react";

export default function Wishlist() {
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const { wishlistItems, removeFromWishlist, addToCart, getCartCount } = useCart();
  const { rateProduct } = useProducts();

  const handleSearch = (term) => {
    setSearchTerm(term);
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
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Wishlist</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
            </p>
          </div>

          {message && (
            <div className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded">
              {message}
            </div>
          )}

          {wishlistItems.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">Your wishlist is empty</p>
              <Button onClick={() => window.location.href = '/products'}>
                Browse Products
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistItems.map((item) => (
                <Card key={item.id} className="overflow-hidden dark:bg-gray-800">
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-48 object-cover"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-gray-800/90"
                      onClick={() => removeFromWishlist(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </Button>
                  </div>
                  
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold line-clamp-2 text-gray-900 dark:text-white">{item.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{item.category}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{item.company}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg text-gray-900 dark:text-white">${item.price}</span>
                      {item.originalPrice && (
                        <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                          ${item.originalPrice}
                        </span>
                      )}
                    </div>

                   {/* Rating Component - Show average rating only */}
                    <UserRating
                      productId={item.id}
                      userRatings={item.userRatings}
                      onRate={rateProduct}
                      showRatingInterface={false}
                    />
                    
                    <Button
                      onClick={() => handleAddToCart(item)}
                      className="w-full"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 