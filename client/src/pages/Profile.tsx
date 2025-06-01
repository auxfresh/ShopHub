
import { useState } from "react";
import { useLocation } from "wouter";
import { User, Edit3, Package, Heart, MapPin, CreditCard, Settings, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { CartSidebar } from "@/components/CartSidebar";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { firebaseUser } = useAuth();
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSignOut = async () => {
    await signOut();
    setLocation("/");
  };

  if (!firebaseUser) {
    setLocation("/auth");
    return null;
  }

  const menuItems = [
    { icon: Package, label: "My Orders", href: "/orders", badge: "3" },
    { icon: Heart, label: "Wishlist", href: "/wishlist", badge: "12" },
    { icon: MapPin, label: "Addresses", href: "/addresses" },
    { icon: CreditCard, label: "Payment Methods", href: "/payment" },
    { icon: Settings, label: "Account Settings", href: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <Header 
        onCartOpen={() => setCartOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="h-20 w-20 bg-ali-orange rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{firebaseUser.displayName || "User"}</h1>
                <p className="text-gray-600">{firebaseUser.email}</p>
                <Badge className="mt-2 bg-green-100 text-green-800">Verified Account</Badge>
              </div>
              <Button variant="outline" size="sm">
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-ali-orange">15</div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-ali-orange">3</div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-ali-orange">12</div>
              <div className="text-sm text-gray-600">Wishlist</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-ali-orange">$1,250</div>
              <div className="text-sm text-gray-600">Total Spent</div>
            </CardContent>
          </Card>
        </div>

        {/* Menu Items */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {menuItems.map((item, index) => (
              <div key={item.label}>
                <button
                  onClick={() => setLocation(item.href)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="h-5 w-5 text-gray-400" />
                    <span className="font-medium text-gray-900">{item.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.badge && (
                      <Badge className="bg-ali-orange text-white">{item.badge}</Badge>
                    )}
                    <span className="text-gray-400">›</span>
                  </div>
                </button>
                {index < menuItems.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Sign Out */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <Button 
              onClick={handleSignOut}
              variant="destructive" 
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation onCartOpen={() => setCartOpen(true)} />
      <CartSidebar open={cartOpen} onOpenChange={setCartOpen} />
    </div>
  );
}
