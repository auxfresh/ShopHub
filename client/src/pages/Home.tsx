import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { FilterSidebar } from "@/components/FilterSidebar";
import { CartSidebar } from "@/components/CartSidebar";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Filter, ChevronRight } from "lucide-react";
import type { Product, Category } from "@shared/schema";

export default function Home() {
  const [location, setLocation] = useLocation();
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    categoryId: null as number | null,
    minPrice: "",
    maxPrice: "",
    rating: null as number | null,
    freeShipping: false,
    inStock: false,
    sortBy: "best_match" as string,
    limit: 20,
    offset: 0,
  });

  // Parse URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split("?")[1] || "");
    const category = urlParams.get("category");
    const search = urlParams.get("search");

    if (search) {
      setSearchQuery(search);
    }

    if (category) {
      // Find category ID by slug
      categoriesQuery.data?.forEach((cat: Category) => {
        if (cat.slug === category) {
          setFilters(prev => ({ ...prev, categoryId: cat.id }));
        }
      });
    }
  }, [location]);

  // Fetch categories
  const categoriesQuery = useQuery({
    queryKey: ["/api/categories"],
  });

  // Fetch products
  const productsQuery = useQuery({
    queryKey: ["/api/products", filters, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.categoryId) params.append("categoryId", filters.categoryId.toString());
      if (searchQuery) params.append("search", searchQuery);
      if (filters.minPrice) params.append("minPrice", filters.minPrice);
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
      if (filters.sortBy && filters.sortBy !== "best_match") {
        params.append("sortBy", filters.sortBy);
      }
      params.append("limit", filters.limit.toString());
      params.append("offset", filters.offset.toString());

      const response = await fetch(`/api/products?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      return response.json();
    },
  });

  // Fetch featured products
  const featuredQuery = useQuery({
    queryKey: ["/api/products/featured"],
  });

  const handleFiltersChange = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters, offset: 0 }));
  };

  const handleSortChange = (sortBy: string) => {
    setFilters(prev => ({ ...prev, sortBy, offset: 0 }));
  };

  const handleProductClick = (productId: number) => {
    setLocation(`/product/${productId}`);
  };

  const ProductSkeleton = () => (
    <div className="space-y-3">
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-6 w-1/4" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <Header 
        onCartOpen={() => setCartOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-ali-orange to-ali-orange-light text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Mega Sale Event</h2>
          <p className="text-xl mb-8 opacity-90">Up to 70% off on selected items. Free shipping worldwide!</p>
          <Button 
            className="bg-white text-ali-orange hover:bg-gray-100"
            onClick={() => setFilters(prev => ({ ...prev, categoryId: null }))}
          >
            Shop Now
          </Button>
        </div>
      </section>

      {/* Featured Products */}
      {!searchQuery && !filters.categoryId && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Featured Products</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {featuredQuery.isLoading ? (
              [...Array(6)].map((_, i) => <ProductSkeleton key={i} />)
            ) : (
              featuredQuery.data?.slice(0, 6).map((product: Product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onProductClick={handleProductClick}
                />
              ))
            )}
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter Sidebar */}
          <aside className="lg:w-64">
            <FilterSidebar 
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Sort Controls */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-600">
                      {productsQuery.data?.length || 0} products found
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-600">Sort by:</span>
                    <select 
                      value={filters.sortBy} 
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ali-orange focus:border-ali-orange"
                    >
                      <option value="best_match">Best Match</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="rating">Customer Rating</option>
                      <option value="newest">Newest Arrivals</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Products Grid */}
            {productsQuery.isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(12)].map((_, i) => (
                  <Card key={i}>
                    <ProductSkeleton />
                  </Card>
                ))}
              </div>
            ) : productsQuery.data?.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-.82-5.17-2.09" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {productsQuery.data?.map((product: Product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onProductClick={handleProductClick}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {productsQuery.data?.length === filters.limit && (
              <div className="flex items-center justify-center mt-8">
                <Button
                  variant="outline"
                  onClick={() => setFilters(prev => ({ 
                    ...prev, 
                    offset: Math.max(0, prev.offset - prev.limit) 
                  }))}
                  disabled={filters.offset === 0}
                >
                  Previous
                </Button>
                <span className="mx-4 text-gray-600">
                  Page {Math.floor(filters.offset / filters.limit) + 1}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setFilters(prev => ({ 
                    ...prev, 
                    offset: prev.offset + prev.limit 
                  }))}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
      <BottomNavigation onCartOpen={() => setCartOpen(true)} />
    </div>
  );
}
