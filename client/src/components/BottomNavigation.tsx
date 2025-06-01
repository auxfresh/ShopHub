
import { Link, useLocation } from "wouter";
import { Home, Search, ShoppingCart, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";

interface BottomNavigationProps {
  onCartOpen: () => void;
}

export function BottomNavigation({ onCartOpen }: BottomNavigationProps) {
  const [location] = useLocation();
  const { cartItemCount } = useCart();
  const { firebaseUser } = useAuth();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="flex items-center justify-around py-2">
        {/* Home */}
        <Link href="/">
          <button className={`flex flex-col items-center p-2 min-w-[60px] ${
            isActive("/") ? "text-ali-orange" : "text-gray-600"
          }`}>
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </button>
        </Link>

        {/* Products/Search */}
        <Link href="/?search=">
          <button className={`flex flex-col items-center p-2 min-w-[60px] ${
            location.includes("search=") ? "text-ali-orange" : "text-gray-600"
          }`}>
            <Search className="h-5 w-5" />
            <span className="text-xs mt-1">Products</span>
          </button>
        </Link>

        {/* Cart */}
        <button 
          onClick={onCartOpen}
          className="flex flex-col items-center p-2 min-w-[60px] text-gray-600 relative"
        >
          <ShoppingCart className="h-5 w-5" />
          {cartItemCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs bg-ali-orange">
              {cartItemCount}
            </Badge>
          )}
          <span className="text-xs mt-1">Cart</span>
        </button>

        {/* Profile */}
        <Link href={firebaseUser ? "/profile" : "/auth"}>
          <button className={`flex flex-col items-center p-2 min-w-[60px] ${
            isActive("/profile") || isActive("/auth") ? "text-ali-orange" : "text-gray-600"
          }`}>
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">Profile</span>
          </button>
        </Link>
      </div>
    </div>
  );
}
