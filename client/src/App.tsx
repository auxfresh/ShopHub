import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import Home from "@/pages/Home";
import ProductDetail from "@/pages/ProductDetail";
import Auth from "@/pages/Auth";
import Profile from "@/pages/Profile";
import SellerDashboard from "@/pages/SellerDashboard";
import AdminPanel from "@/pages/AdminPanel";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/auth" component={Auth} />
      <Route path="/profile" component={Profile} />
      <Route path="/seller" component={SellerDashboard} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/orders" component={() => <div>Orders Page - Coming Soon</div>} />
      <Route path="/wishlist" component={() => <div>Wishlist Page - Coming Soon</div>} />
      <Route path="/checkout" component={() => <div>Checkout Page - Coming Soon</div>} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
