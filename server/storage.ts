import { 
  User, InsertUser, 
  Category, InsertCategory, 
  Product, InsertProduct, 
  CartItem, InsertCartItem, 
  Order, InsertOrder, 
  OrderItem, InsertOrderItem, 
  Review, InsertReview, 
  Wishlist, InsertWishlist 
} from "../shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Products
  getProducts(filters?: {
    categoryId?: number;
    sellerId?: number;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
    limit?: number;
    offset?: number;
  }): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  getProductsBySeller(sellerId: number): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;

  // Cart
  getCartItems(userId: number): Promise<(CartItem & { product: Product })[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<boolean>;
  clearCart(userId: number): Promise<boolean>;

  // Orders
  getOrders(userId?: number): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  getOrderItems(orderId: number): Promise<(OrderItem & { product: Product })[]>;

  // Reviews
  getProductReviews(productId: number): Promise<(Review & { user: User })[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Wishlist
  getWishlist(userId: number): Promise<(Wishlist & { product: Product })[]>;
  addToWishlist(wishlistItem: InsertWishlist): Promise<Wishlist>;
  removeFromWishlist(userId: number, productId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users = new Map<number, User>();
  private categories = new Map<number, Category>();
  private products = new Map<number, Product>();
  private cartItems = new Map<number, CartItem>();
  private orders = new Map<number, Order>();
  private orderItems = new Map<number, OrderItem>();
  private reviews = new Map<number, Review>();
  private wishlist = new Map<number, Wishlist>();

  private currentUserId = 1;
  private currentCategoryId = 1;
  private currentProductId = 1;
  private currentCartItemId = 1;
  private currentOrderId = 1;
  private currentOrderItemId = 1;
  private currentReviewId = 1;
  private currentWishlistId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed categories
    const categoriesData = [
      { name: "Electronics", slug: "electronics", icon: "💻" },
      { name: "Fashion", slug: "fashion", icon: "👕" },
      { name: "Home & Garden", slug: "home-garden", icon: "🏠" },
      { name: "Sports", slug: "sports", icon: "⚽" },
      { name: "Beauty", slug: "beauty", icon: "💄" },
    ];

    categoriesData.forEach(cat => {
      const category: Category = { 
        id: this.currentCategoryId++, 
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon
      };
      this.categories.set(category.id, category);
    });

    // Seed users
    const usersData = [
      { name: "Admin User", email: "ayatullahiayobami@gmail.com", role: "admin", firebaseUid: "admin123" },
      { name: "John Seller", email: "seller@example.com", role: "seller", firebaseUid: "seller123" },
      { name: "Jane Customer", email: "customer@example.com", role: "customer", firebaseUid: "customer123" },
    ];

    usersData.forEach(userData => {
      const user: User = {
        id: this.currentUserId++,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        firebaseUid: userData.firebaseUid,
        createdAt: new Date(),
      };
      this.users.set(user.id, user);
    });

    // Seed products
    const productsData = [
      {
        name: "Premium Wireless Earbuds",
        description: "High-quality wireless earbuds with active noise cancellation.",
        price: "59.99",
        originalPrice: "79.99",
        categoryId: 1,
        sellerId: 2,
        images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
        rating: "4.2",
        reviewCount: 127,
        stock: 50,
        tags: ["wireless", "noise-cancellation", "premium"],
        specifications: { "Battery Life": "24 hours", "Driver Size": "12mm", "Connectivity": "Bluetooth 5.0" },
        isFeatured: true,
      },
      {
        name: "Gaming Laptop",
        description: "High-performance gaming laptop with RTX graphics.",
        price: "1299.99",
        originalPrice: "1499.99",
        categoryId: 1,
        sellerId: 2,
        images: ["https://images.unsplash.com/photo-1603302576837-37561b2e2302?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
        rating: "4.5",
        reviewCount: 89,
        stock: 25,
        tags: ["gaming", "laptop", "RTX"],
        specifications: { "CPU": "Intel i7", "GPU": "RTX 3060", "RAM": "16GB", "Storage": "512GB SSD" },
        isFeatured: true,
      },
    ];

    productsData.forEach(prod => {
      const product: Product = {
        id: this.currentProductId++,
        name: prod.name,
        description: prod.description,
        price: prod.price,
        originalPrice: prod.originalPrice,
        categoryId: prod.categoryId,
        sellerId: prod.sellerId,
        images: prod.images,
        rating: prod.rating,
        reviewCount: prod.reviewCount,
        stock: prod.stock,
        tags: prod.tags,
        specifications: prod.specifications,
        isActive: true,
        isFeatured: prod.isFeatured,
        createdAt: new Date(),
      };
      this.products.set(product.id, product);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.firebaseUid === firebaseUid);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.currentUserId++,
      name: insertUser.name,
      email: insertUser.email,
      role: insertUser.role || "customer",
      firebaseUid: insertUser.firebaseUid,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updatedUser = { ...user, ...updateData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const category: Category = {
      id: this.currentCategoryId++,
      name: insertCategory.name,
      slug: insertCategory.slug,
      icon: insertCategory.icon || null,
    };
    this.categories.set(category.id, category);
    return category;
  }

  // Product methods
  async getProducts(filters?: any): Promise<Product[]> {
    let products = Array.from(this.products.values()).filter(p => p.isActive);
    
    if (filters?.categoryId) {
      products = products.filter(p => p.categoryId === filters.categoryId);
    }
    
    return products;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const product: Product = {
      id: this.currentProductId++,
      name: insertProduct.name,
      description: insertProduct.description,
      price: insertProduct.price,
      originalPrice: insertProduct.originalPrice || null,
      categoryId: insertProduct.categoryId || null,
      sellerId: insertProduct.sellerId || null,
      images: insertProduct.images || [],
      rating: insertProduct.rating || null,
      reviewCount: insertProduct.reviewCount || 0,
      stock: insertProduct.stock || 0,
      tags: insertProduct.tags || null,
      specifications: insertProduct.specifications || null,
      isActive: true,
      isFeatured: false,
      createdAt: new Date(),
    };
    this.products.set(product.id, product);
    return product;
  }

  async updateProduct(id: number, updateData: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    const updatedProduct = { ...product, ...updateData };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  async getProductsBySeller(sellerId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.sellerId === sellerId);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.isFeatured && p.isActive);
  }

  // Cart methods
  async getCartItems(userId: number): Promise<(CartItem & { product: Product })[]> {
    const cartItems = Array.from(this.cartItems.values()).filter(item => item.userId === userId);
    return cartItems.map(item => ({
      ...item,
      product: this.products.get(item.productId!)!
    })).filter(item => item.product);
  }

  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    const cartItem: CartItem = {
      id: this.currentCartItemId++,
      userId: insertCartItem.userId || null,
      productId: insertCartItem.productId || null,
      quantity: insertCartItem.quantity || 1,
      createdAt: new Date(),
    };
    this.cartItems.set(cartItem.id, cartItem);
    return cartItem;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return undefined;
    cartItem.quantity = quantity;
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async removeFromCart(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(userId: number): Promise<boolean> {
    const itemsToRemove = Array.from(this.cartItems.entries())
      .filter(([_, item]) => item.userId === userId)
      .map(([id]) => id);
    
    itemsToRemove.forEach(id => this.cartItems.delete(id));
    return true;
  }

  // Order methods
  async getOrders(userId?: number): Promise<Order[]> {
    let orders = Array.from(this.orders.values());
    if (userId) {
      orders = orders.filter(order => order.userId === userId);
    }
    return orders;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(insertOrder: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const order: Order = {
      id: this.currentOrderId++,
      userId: insertOrder.userId || null,
      status: insertOrder.status || "pending",
      total: insertOrder.total,
      shippingAddress: insertOrder.shippingAddress || null,
      createdAt: new Date(),
    };
    this.orders.set(order.id, order);

    items.forEach(item => {
      const orderItem: OrderItem = {
        id: this.currentOrderItemId++,
        productId: item.productId || null,
        quantity: item.quantity || 1,
        price: item.price || "0",
        orderId: order.id,
      };
      this.orderItems.set(orderItem.id, orderItem);
    });

    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    order.status = status;
    this.orders.set(id, order);
    return order;
  }

  async getOrderItems(orderId: number): Promise<(OrderItem & { product: Product })[]> {
    const orderItems = Array.from(this.orderItems.values()).filter(item => item.orderId === orderId);
    return orderItems.map(item => ({
      ...item,
      product: this.products.get(item.productId!)!
    })).filter(item => item.product);
  }

  // Review methods
  async getProductReviews(productId: number): Promise<(Review & { user: User })[]> {
    const reviews = Array.from(this.reviews.values()).filter(review => review.productId === productId);
    return reviews.map(review => ({
      ...review,
      user: this.users.get(review.userId!)!
    })).filter(review => review.user);
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const review: Review = {
      id: this.currentReviewId++,
      productId: insertReview.productId || null,
      userId: insertReview.userId || null,
      rating: insertReview.rating,
      comment: insertReview.comment || null,
      createdAt: new Date(),
    };
    this.reviews.set(review.id, review);
    return review;
  }

  // Wishlist methods
  async getWishlist(userId: number): Promise<(Wishlist & { product: Product })[]> {
    const wishlistItems = Array.from(this.wishlist.values()).filter(item => item.userId === userId);
    return wishlistItems.map(item => ({
      ...item,
      product: this.products.get(item.productId!)!
    })).filter(item => item.product);
  }

  async addToWishlist(insertWishlistItem: InsertWishlist): Promise<Wishlist> {
    const wishlistItem: Wishlist = {
      id: this.currentWishlistId++,
      userId: insertWishlistItem.userId || null,
      productId: insertWishlistItem.productId || null,
      createdAt: new Date(),
    };
    this.wishlist.set(wishlistItem.id, wishlistItem);
    return wishlistItem;
  }

  async removeFromWishlist(userId: number, productId: number): Promise<boolean> {
    const item = Array.from(this.wishlist.entries())
      .find(([_, item]) => item.userId === userId && item.productId === productId);
    
    if (item) {
      this.wishlist.delete(item[0]);
      return true;
    }
    return false;
  }
}

export const storage = new MemStorage();