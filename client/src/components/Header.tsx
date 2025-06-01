import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, ShoppingCart, Heart, User, Menu, X, Settings, Store, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/auth";

const categories = [
  { name: "Electronics", slug: "electronics", icon: "fas fa-laptop" },
  { name: "Fashion", slug: "fashion", icon: "fas fa-tshirt" },
  { name: "Home & Garden", slug: "home", icon: "fas fa-home" },
  { name: "Sports", slug: "sports", icon: "fas fa-dumbbell" },
  { name: "Beauty", slug: "beauty", icon: "fas fa-spa" },
  { name: "Kitchen", slug: "kitchen", icon: "fas fa-utensils" },
];

interface HeaderProps {
  onCartOpen: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Header({ onCartOpen, searchQuery, onSearchChange }: HeaderProps) {
  const [, setLocation] = useLocation();
  const { firebaseUser } = useAuth();
  const { cartItemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setLocation("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      {/* Top Banner */}
      <div className="bg-ali-orange text-white text-center py-2 text-sm">
        Free shipping on orders over $29! Limited time offer.
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link href="/">
              <h1 className="text-2xl font-bold text-ali-orange cursor-pointer">Shop Hub</h1>
            </Link>

            {/* Desktop Categories */}
            <div className="hidden md:flex items-center space-x-6 ml-8">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-1">
                    <Menu className="h-4 w-4" />
                    <span>Categories</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  {categories.map((category) => (
                    <DropdownMenuItem key={category.slug} asChild>
                      <Link href={`/?category=${category.slug}`} className="cursor-pointer">
                        <i className={`${category.icon} mr-2`} />
                        {category.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Search Bar - Hidden on mobile, shown on desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ali-orange focus:border-ali-orange"
              />
              <Button 
                type="submit"
                size="sm"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-ali-orange hover:bg-ali-orange-dark"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Mobile Search Button */}
            <Button variant="ghost" size="sm" className="md:hidden">
              <Search className="h-5 w-5" />
            </Button>

            {/* Wishlist - Hidden on mobile */}
            <Button variant="ghost" size="sm" className="relative hidden md:flex" asChild>
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-ali-orange">
                  0
                </Badge>
              </Link>
            </Button>

            {/* Cart */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative"
              onClick={onCartOpen}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-ali-orange">
                  {cartItemCount}
                </Badge>
              )}
            </Button>

            {/* User Menu */}
            {firebaseUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span className="hidden lg:inline">Account</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders">My Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/seller">Seller Dashboard</Link>
                  </DropdownMenuItem>
                 
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild className="bg-ali-orange hover:bg-ali-orange-dark text-xs md:text-sm px-2 md:px-4">
                <Link href="/auth">Sign In</Link>
              </Button>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="py-4">
                  {/* Mobile Search */}
                  <div className="mb-6">
                    <form onSubmit={handleSearch} className="relative">
                      <Input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ali-orange focus:border-ali-orange"
                      />
                      <Button 
                        type="submit"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-ali-orange hover:bg-ali-orange-dark h-8 w-8 p-0"
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>

                  <h2 className="text-lg font-semibold mb-4">Categories</h2>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <Link 
                        key={category.slug}
                        href={`/?category=${category.slug}`}
                        className="block py-2 px-4 text-gray-700 hover:text-ali-orange transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <i className={`${category.icon} mr-3`} />
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
