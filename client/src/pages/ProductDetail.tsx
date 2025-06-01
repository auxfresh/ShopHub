import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ShoppingCart, 
  Heart, 
  Star, 
  Minus, 
  Plus, 
  Truck, 
  Shield, 
  RotateCcw,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/Header";
import { CartSidebar } from "@/components/CartSidebar";
import { ProductCard } from "@/components/ProductCard";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Product, Review, User } from "@shared/schema";

export default function ProductDetail() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { firebaseUser } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });

  const productId = parseInt(params.id as string);

  // Fetch product details
  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ["/api/products", productId],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) {
        throw new Error("Product not found");
      }
      return response.json();
    },
  });

  // Fetch product reviews
  const { data: reviews = [] } = useQuery({
    queryKey: ["/api/products", productId, "reviews"],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}/reviews`);
      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }
      return response.json();
    },
    enabled: !!productId,
  });

  // Fetch related products
  const { data: relatedProducts = [] } = useQuery({
    queryKey: ["/api/products", "related", product?.categoryId],
    queryFn: async () => {
      const response = await fetch(`/api/products?categoryId=${product.categoryId}&limit=8`);
      if (!response.ok) {
        throw new Error("Failed to fetch related products");
      }
      return response.json();
    },
    enabled: !!product?.categoryId,
  });

  // Add review mutation
  const addReviewMutation = useMutation({
    mutationFn: async (reviewData: { rating: number; comment: string }) => {
      if (!firebaseUser) throw new Error("Authentication required");
      
      return await apiRequest("POST", `/api/products/${productId}/reviews`, reviewData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products", productId, "reviews"] });
      setNewReview({ rating: 5, comment: "" });
      toast({
        title: "Success",
        description: "Review added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add review",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = async () => {
    if (!firebaseUser) {
      setLocation("/auth");
      return;
    }

    try {
      await addToCart(productId, quantity);
      setCartOpen(true);
    } catch (error) {
      // Error is handled by the cart hook
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) {
      setLocation("/auth");
      return;
    }

    if (!newReview.comment.trim()) {
      toast({
        title: "Error",
        description: "Please write a review comment",
        variant: "destructive",
      });
      return;
    }

    await addReviewMutation.mutateAsync(newReview);
  };

  const renderStars = (rating: number, size = "w-4 h-4") => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`${size} ${
              i < rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const renderRatingStars = (rating: number, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-6 h-6 cursor-pointer transition-colors ${
              i < rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300 hover:text-yellow-400"
            }`}
            onClick={() => onRatingChange?.(i + 1)}
          />
        ))}
      </div>
    );
  };

  if (productLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          onCartOpen={() => setCartOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-300 h-96 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-6 bg-gray-300 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          onCartOpen={() => setCartOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
            <Button onClick={() => setLocation("/")} className="bg-ali-orange hover:bg-ali-orange-dark">
              Back to Home
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const discountPercentage = product.originalPrice
    ? Math.round(((parseFloat(product.originalPrice) - parseFloat(product.price)) / parseFloat(product.originalPrice)) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onCartOpen={() => setCartOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Button variant="link" className="p-0 h-auto" onClick={() => setLocation("/")}>
                Home
              </Button>
            </li>
            <ChevronRight className="w-4 h-4" />
            <li>
              <Button variant="link" className="p-0 h-auto" onClick={() => setLocation(`/?category=${product.categoryId}`)}>
                Category
              </Button>
            </li>
            <ChevronRight className="w-4 h-4" />
            <li className="text-gray-900 truncate">{product.name}</li>
          </ol>
        </nav>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <div className="aspect-square relative">
                <img
                  src={product.images[selectedImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {discountPercentage > 0 && (
                  <Badge className="absolute top-4 left-4 bg-red-500 text-white">
                    -{discountPercentage}%
                  </Badge>
                )}
              </div>
            </Card>
            
            {/* Image Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index ? "border-ali-orange" : "border-gray-200"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  {renderStars(parseFloat(product.rating || "0"))}
                  <span className="text-sm text-gray-600">
                    ({product.reviewCount} reviews)
                  </span>
                </div>
                {product.isFeatured && (
                  <Badge className="bg-green-500">Featured</Badge>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-ali-orange">
                  ${parseFloat(product.price).toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-500 line-through">
                    ${parseFloat(product.originalPrice).toFixed(2)}
                  </span>
                )}
              </div>
              {discountPercentage > 0 && (
                <p className="text-green-600 font-medium">
                  You save ${(parseFloat(product.originalPrice!) - parseFloat(product.price)).toFixed(2)} ({discountPercentage}%)
                </p>
              )}
            </div>

            <Separator />

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Stock:</span>
              {product.stock > 0 ? (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  {product.stock} items available
                </Badge>
              ) : (
                <Badge variant="outline" className="text-red-600 border-red-600">
                  Out of stock
                </Badge>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="px-4 py-2 border border-gray-300 rounded-md min-w-[60px] text-center">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Add to Cart & Wishlist */}
            <div className="flex space-x-4">
              <Button
                className="flex-1 bg-ali-orange hover:bg-ali-orange-dark"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
              <Button variant="outline" size="lg">
                <Heart className="w-4 h-4" />
              </Button>
            </div>

            {/* Shipping & Benefits */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <Truck className="w-5 h-5 text-ali-orange" />
                  <div>
                    <p className="font-medium">Free Shipping</p>
                    <p className="text-sm text-gray-600">On orders over $29</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-ali-orange" />
                  <div>
                    <p className="font-medium">Buyer Protection</p>
                    <p className="text-sm text-gray-600">Full refund if item not received</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <RotateCcw className="w-5 h-5 text-ali-orange" />
                  <div>
                    <p className="font-medium">30-Day Returns</p>
                    <p className="text-sm text-gray-600">Easy returns for peace of mind</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Card className="mb-12">
          <Tabs defaultValue="description" className="w-full">
            <CardHeader>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="description" className="space-y-4">
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                  {product.tags && product.tags.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium mb-2">Tags:</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="specifications" className="space-y-4">
                {product.specifications && Object.keys(product.specifications).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-medium capitalize">{key}:</span>
                        <span className="text-gray-600">{value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No specifications available for this product.</p>
                )}
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                {/* Add Review Form */}
                {firebaseUser && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Write a Review</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmitReview} className="space-y-4">
                        <div>
                          <Label htmlFor="rating">Rating</Label>
                          <div className="mt-2">
                            {renderRatingStars(newReview.rating, (rating) => 
                              setNewReview(prev => ({ ...prev, rating }))
                            )}
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="comment">Review</Label>
                          <Textarea
                            id="comment"
                            placeholder="Share your experience with this product..."
                            value={newReview.comment}
                            onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                            className="mt-2"
                            rows={4}
                          />
                        </div>
                        <Button 
                          type="submit" 
                          className="bg-ali-orange hover:bg-ali-orange-dark"
                          disabled={addReviewMutation.isPending}
                        >
                          {addReviewMutation.isPending ? "Submitting..." : "Submit Review"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                )}

                {/* Reviews List */}
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <p className="text-gray-600 text-center py-8">
                      No reviews yet. Be the first to review this product!
                    </p>
                  ) : (
                    reviews.map((review: Review & { user: User }) => (
                      <Card key={review.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium">{review.user.name}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                {renderStars(review.rating)}
                                <span className="text-sm text-gray-600">
                                  {new Date(review.createdAt!).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-gray-700 mt-2">{review.comment}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {relatedProducts
                .filter((p: Product) => p.id !== productId)
                .slice(0, 6)
                .map((product: Product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
            </div>
          </section>
        )}
      </main>

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
