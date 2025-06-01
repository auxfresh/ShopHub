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
    <Card className="card-enhanced group cursor-pointer" onClick={handleProductClick}>
      <div className="aspect-square relative overflow-hidden">
        <img
          src={product.images?.[0] || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm hover:bg-white shadow-md"
          onClick={handleWishlistToggle}
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isInWishlist ? "fill-red-500 text-red-500" : "text-gray-600 hover:text-red-500"
            }`}
          />
        </Button>

        {discountPercentage > 0 && (
          <Badge className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md">
            {discountPercentage}% OFF
          </Badge>
        )}

        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <Button
            onClick={handleAddToCart}
            className="w-full btn-ali-primary text-sm py-2"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Quick Add
          </Button>
        </div>
      </div>

      <CardContent className="p-5">
        <h3 className="font-semibold text-base mb-3 line-clamp-2 group-hover:text-ali-orange transition-colors cursor-pointer" onClick={handleProductClick}>{product.name}</h3>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(parseFloat(product.rating || "0"))
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-200 text-gray-200"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 font-medium">{product.rating}</span>
          <span className="text-xs text-gray-400">({product.reviewCount} reviews)</span>
        </div>

        <div className="flex items-baseline gap-2 mb-4">
          <span className="font-bold text-xl text-gradient">
            ${parseFloat(product.price).toFixed(2)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              ${parseFloat(product.originalPrice).toFixed(2)}
            </span>
          )}
        </div>

        {product.stock && product.stock < 10 && (
          <div className="mb-3">
            <Badge variant="outline" className="status-warning text-xs">
              Only {product.stock} left!
            </Badge>
          </div>
        )}

        <div className="space-y-2">
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