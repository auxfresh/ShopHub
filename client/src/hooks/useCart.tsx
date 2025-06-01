import { createContext, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";
import type { CartItem, Product } from "@shared/schema";

interface CartContextType {
  cartItems: (CartItem & { product: Product })[];
  isLoading: boolean;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartTotal: number;
  cartItemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ["/api/cart"],
    enabled: !!firebaseUser,
    queryFn: async () => {
      const response = await fetch("/api/cart", {
        headers: {
          'x-firebase-uid': firebaseUser!.uid,
        },
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch cart items");
      }
      
      return response.json();
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity = 1 }: { productId: number; quantity?: number }) => {
      if (!firebaseUser) throw new Error("Authentication required");
      
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'x-firebase-uid': firebaseUser.uid,
        },
        body: JSON.stringify({ productId, quantity }),
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to add item to cart");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Success",
        description: "Item added to cart",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ cartItemId, quantity }: { cartItemId: number; quantity: number }) => {
      const response = await fetch(`/api/cart/${cartItemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to update cart item");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update cart item",
        variant: "destructive",
      });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (cartItemId: number) => {
      const response = await fetch(`/api/cart/${cartItemId}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to remove item from cart");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Success",
        description: "Item removed from cart",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      if (!firebaseUser) throw new Error("Authentication required");
      
      const response = await fetch("/api/cart", {
        method: "DELETE",
        headers: {
          'x-firebase-uid': firebaseUser.uid,
        },
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to clear cart");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Success",
        description: "Cart cleared",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive",
      });
    },
  });

  const cartTotal = cartItems.reduce((total, item) => 
    total + (parseFloat(item.product.price) * item.quantity), 0
  );

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const addToCart = async (productId: number, quantity = 1) => {
    await addToCartMutation.mutateAsync({ productId, quantity });
  };

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    await updateQuantityMutation.mutateAsync({ cartItemId, quantity });
  };

  const removeFromCart = async (cartItemId: number) => {
    await removeFromCartMutation.mutateAsync(cartItemId);
  };

  const clearCart = async () => {
    await clearCartMutation.mutateAsync();
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      isLoading,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      cartTotal,
      cartItemCount,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
