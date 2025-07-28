import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";

interface UserRating {
  userId: string;
  rating: number;
  timestamp: Date;
}

interface UserRatingProps {
  productId: number;
  userRatings: UserRating[];
  onRate: (productId: number, rating: number) => void;
  showRatingInterface?: boolean; // Optional prop to override default behavior
}

// export function UserRating({ productId, userRatings, onRate }: UserRatingProps) {
    export function UserRating({ productId, userRatings, onRate, showRatingInterface }: UserRatingProps) {
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const { isInCart, isInWishlist } = useCart();

  // Calculate average rating
  const averageRating = userRatings.length > 0 
    ? userRatings.reduce((sum, rating) => sum + rating.rating, 0) / userRatings.length 
    : 0;

  // Check if current user has already rated (using a mock user ID for now)
  const currentUserId = "user123"; // In a real app, this would come from auth context
  const userHasRated = userRatings.some(rating => rating.userId === currentUserId);
  
// Determine if rating interface should be shown
const canRate = showRatingInterface !== undefined 
  ? showRatingInterface 
  : isInCart(productId) || isInWishlist(productId);

  const handleRating = (rating: number) => {
    if (!userHasRated) {
      onRate(productId, rating);
      setSelectedRating(0);
    }
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isFilled = interactive 
        ? starValue <= (hoveredRating || selectedRating)
        : starValue <= rating;

      return (
        <Star
          key={index}
          className={`w-4 h-4 cursor-pointer transition-colors ${
            isFilled ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
          // onClick={() => interactive && handleRating(starValue)}
          onClick={() => interactive && setSelectedRating(starValue)}
          onMouseEnter={() => interactive && setHoveredRating(starValue)}
          onMouseLeave={() => interactive && setHoveredRating(0)}
        />
      );
    });
  };

  return (
    <div className="space-y-3">
      {/* Display current rating */}
      <div className="flex items-center gap-2">
        <div className="flex">
          {renderStars(averageRating)}
        </div>
        <span className="text-sm text-muted-foreground">
          {averageRating.toFixed(1)} ({userRatings.length} reviews)
        </span>
      </div>

      {/* User rating interface */}
      {/* {!userHasRated && ( */}
      {!userHasRated && canRate && (
        <Card className="p-3">
          <CardContent className="p-0">
            <div className="space-y-2">
              <p className="text-sm font-medium">Rate this product:</p>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {renderStars(selectedRating, true)}
                </div>
                {selectedRating > 0 && (
                  <Button 
                    size="sm" 
                    onClick={() => handleRating(selectedRating)}
                    className="h-6 px-2 text-xs"
                  >
                    Submit
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* {userHasRated && ( */}
      {userHasRated && canRate && (
        <p className="text-xs text-muted-foreground">Thank you for rating this product!</p>
      )}
      
      {!canRate && !userHasRated && (
        <p className="text-xs text-muted-foreground">Add to cart or wishlist to rate this product</p>
      )}
    </div>
  );
}