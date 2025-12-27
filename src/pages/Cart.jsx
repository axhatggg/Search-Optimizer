import { useState } from "react";
import { Header } from "@/components/Header";
import { useCart } from "@/contexts/CartContext";
import { useProducts } from "@/contexts/ProductsContext";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserRating } from "@/components/UserRating";
import { Trash2, Minus, Plus } from "lucide-react";

export default function Cart() {
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const { cartItems, removeFromCart, addToCart, getCartCount } = useCart();
  const { rateProduct } = useProducts();

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleQuantityChange = (productId, change) => {
    const item = cartItems.find(item => item.id === productId);
    if (item && item.quantity + change > 0) {
      if (change > 0) {
        addToCart(item);
      } else {
        // For decreasing quantity, we'd need to modify the cart context
        // For now, we'll just show a message
        setMessage("Quantity decrease will be available soon.");
        setTimeout(() => setMessage(""), 3000);
      }
    }
  };

  const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header onSearch={handleSearch} cartCount={getCartCount()} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shopping Cart</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
            </p>
          </div>

          {message && (
            <div className="bg-blue-100 dark:bg-blue-900 border border-blue-400 dark:border-blue-700 text-blue-700 dark:text-blue-300 px-4 py-3 rounded">
              {message}
            </div>
          )}

          {cartItems.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">Your cart is empty</p>
              <Button onClick={() => window.location.href = '/products'}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.id} className="p-4 dark:bg-gray-800">
                    <CardContent className="p-0">
                      <div className="flex gap-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded-md"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{item.category}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{item.company}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleQuantityChange(item.id, -1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center text-gray-900 dark:text-white">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleQuantityChange(item.id, 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900 dark:text-white">${(item.price * item.quantity).toFixed(2)}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">${item.price} each</p>
                            </div>
                          </div>

                          {/* Rating Component - Only shown for cart items */}
                          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                            <UserRating
                              productId={item.id}
                              userRatings={item.userRatings}
                              onRate={rateProduct}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="lg:col-span-1">
                <Card className="p-6 sticky top-4 dark:bg-gray-800">
                  <CardContent className="p-0 space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Order Summary</h2>
                    <div className="space-y-2">
                      <div className="flex justify-between text-gray-700 dark:text-gray-300">
                        <span>Subtotal</span>
                        <span>${totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-700 dark:text-gray-300">
                        <span>Shipping</span>
                        <span>Free</span>
                      </div>
                      <div className="flex justify-between text-gray-700 dark:text-gray-300">
                        <span>Tax</span>
                        <span>${(totalAmount * 0.1).toFixed(2)}</span>
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                        <div className="flex justify-between font-semibold text-lg text-gray-900 dark:text-white">
                          <span>Total</span>
                          <span>${(totalAmount * 1.1).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-0 pt-4">
                    <Button className="w-full" size="lg">
                      Proceed to Checkout
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 