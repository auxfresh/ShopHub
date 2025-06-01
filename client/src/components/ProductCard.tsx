import { useState } from "react";
import { Heart, Star, ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  onProductClick?: (productId: number) => void;
}

export function ProductCard({ product, onProductClick }: ProductCardProps) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart } = useCart();
  const { firebaseUser } = useAuth();
  const [, setLocation] = useLocation();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!firebaseUser) {
      setLocation("/auth");
      return;
    }

    setIsAddingToCart(true);
    try {
      await addToCart(product.id);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!firebaseUser) {
      setLocation("/auth");
      return;
    }

    setIsInWishlist(!isInWishlist);
    // TODO: Implement wishlist API calls
  };

  const handleProductClick = () => {
    if (onProductClick) {
      onProductClick(product.id);
    } else {
      setLocation(`/product/${product.id}`);
    }
  };

  const discountPercentage = product.originalPrice
    ? Math.round(((parseFloat(product.originalPrice) - parseFloat(product.price)) / parseFloat(product.originalPrice)) * 100)
    : 0;

  const renderStars = (rating: string) => {
    const numRating = parseFloat(rating);
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 >= 0.5;
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
              i < fullStars
                ? "text-yellow-400 fill-yellow-400"
                : i === fullStars && hasHalfStar
                ? "text-yellow-400 fill-yellow-400/50"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="relative overflow-hidden" onClick={handleProductClick}>
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discountPercentage > 0 && (
            <Badge className="bg-red-500 text-white text-xs px-2 py-1">
              -{discountPercentage}%
            </Badge>
          )}
          {product.isFeatured && (
            <Badge className="bg-green-500 text-white text-xs px-2 py-1">
              Featured
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 p-1 h-8 w-8 bg-white/80 hover:bg-white"
          onClick={handleWishlistToggle}
        >
          <Heart 
            className={`h-4 w-4 transition-colors ${
              isInWishlist ? "text-red-500 fill-red-500" : "text-gray-600"
            }`} 
          />
        </Button>
      </div>

      <CardContent className="p-4">
        <div onClick={handleProductClick}>
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
            {product.name}
          </h3>
          
          <div className="flex items-center mb-2 gap-2">
            {renderStars(product.rating || "0")}
            <span className="text-gray-500 text-sm">({product.reviewCount})</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-ali-orange font-bold text-lg">
              ${parseFloat(product.price).toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-gray-500 text-sm line-through">
                ${parseFloat(product.originalPrice).toFixed(2)}
              </span>
            )}
          </div>
          
          <Button
            size="sm"
            className="bg-ali-orange hover:bg-ali-orange-dark text-white opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleAddToCart}
            disabled={isAddingToCart || product.stock === 0}
          >
            {isAddingToCart ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <ShoppingCart className="h-4 w-4" />
            )}
          </Button>
        </div>

        {product.stock === 0 && (
          <Badge variant="secondary" className="mt-2 w-full justify-center">
            Out of Stock
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
