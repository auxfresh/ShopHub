import { 
  users, categories, products, cartItems, orders, orderItems, reviews, wishlist,
  type User, type InsertUser, type Category, type InsertCategory, 
  type Product, type InsertProduct, type CartItem, type InsertCartItem,
  type Order, type InsertOrder, type OrderItem, type InsertOrderItem,
  type Review, type InsertReview, type Wishlist, type InsertWishlist
} from "@shared/schema";

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
  private users: Map<number, User> = new Map();
  private categories: Map<number, Category> = new Map();
  private products: Map<number, Product> = new Map();
  private cartItems: Map<number, CartItem> = new Map();
  private orders: Map<number, Order> = new Map();
  private orderItems: Map<number, OrderItem> = new Map();
  private reviews: Map<number, Review> = new Map();
  private wishlist: Map<number, Wishlist> = new Map();
  
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
      { name: "Electronics", slug: "electronics", icon: "fas fa-laptop" },
      { name: "Fashion", slug: "fashion", icon: "fas fa-tshirt" },
      { name: "Home & Garden", slug: "home", icon: "fas fa-home" },
      { name: "Sports", slug: "sports", icon: "fas fa-dumbbell" },
      { name: "Beauty", slug: "beauty", icon: "fas fa-spa" },
      { name: "Kitchen", slug: "kitchen", icon: "fas fa-utensils" },
    ];

    categoriesData.forEach(cat => {
      const category: Category = { id: this.currentCategoryId++, ...cat };
      this.categories.set(category.id, category);
    });

    // Seed sample products
    const productsData = [
      // Electronics
      {
        name: "Premium Wireless Earbuds with Noise Cancellation",
        description: "High-quality wireless earbuds with active noise cancellation, premium sound quality, and long battery life.",
        price: "59.99",
        originalPrice: "79.99",
        categoryId: 1,
        sellerId: 1,
        images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
        rating: "4.2",
        reviewCount: 127,
        stock: 50,
        tags: ["wireless", "noise-cancellation", "premium"],
        specifications: {},
      },
      {
        name: "Gaming Laptop 15.6\" RTX Graphics",
        description: "High-performance gaming laptop with latest RTX graphics card, fast processor, and RGB keyboard.",
        price: "1299.99",
        categoryId: 1,
        sellerId: 1,
        images: ["https://images.unsplash.com/photo-1603302576837-37561b2e2302?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
        rating: "4.8",
        reviewCount: 89,
        stock: 15,
        tags: ["gaming", "laptop", "rtx"],
      },
      {
        name: "Latest Smartphone 128GB Pro Max",
        description: "Latest flagship smartphone with advanced camera system, fast processor, and premium build quality.",
        price: "899.99",
        categoryId: 1,
        sellerId: 1,
        images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
        rating: "4.3",
        reviewCount: 245,
        stock: 30,
        tags: ["smartphone", "pro", "flagship"],
        isFeatured: true,
      },
      {
        name: "Professional Wireless Headphones",
        description: "Studio-quality wireless headphones with premium drivers and comfortable design for extended use.",
        price: "129.99",
        categoryId: 1,
        sellerId: 1,
        images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
        rating: "4.5",
        reviewCount: 156,
        stock: 25,
        tags: ["headphones", "wireless", "professional"],
      },
      {
        name: "Smart Watch Series 8",
        description: "Advanced smartwatch with health monitoring, GPS, and long battery life.",
        price: "399.99",
        categoryId: 1,
        sellerId: 1,
        images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
        rating: "4.6",
        reviewCount: 203,
        stock: 40,
        tags: ["smartwatch", "health", "gps"],
      },
      {
        name: "Digital Camera 4K",
        description: "Professional digital camera with 4K video recording and advanced autofocus system.",
        price: "899.99",
        categoryId: 1,
        sellerId: 1,
        images: ["https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
        rating: "4.4",
        reviewCount: 78,
        stock: 12,
        tags: ["camera", "4k", "professional"],
      },
      {
        name: "Wireless Gaming Mouse",
        description: "High-precision wireless gaming mouse with customizable RGB lighting and programmable buttons.",
        price: "79.99",
        categoryId: 1,
        sellerId: 1,
        images: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
        rating: "4.7",
        reviewCount: 134,
        stock: 60,
        tags: ["gaming", "mouse", "wireless"],
      },
      {
        name: "Mechanical Gaming Keyboard",
        description: "Premium mechanical keyboard with tactile switches and customizable RGB backlighting.",
        price: "149.99",
        categoryId: 1,
        sellerId: 1,
        images: ["https://images.unsplash.com/photo-1541140532154-b024d705b90a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
        rating: "4.8",
        reviewCount: 98,
        stock: 35,
        tags: ["keyboard", "mechanical", "gaming"],
      },

      // Fashion
      {
        name: "Classic Denim Jacket - Vintage Style",
        description: "Timeless denim jacket with vintage styling and premium denim fabric.",
        price: "49.99",
        originalPrice: "69.99",
        categoryId: 2,
        sellerId: 1,
        images: ["https://images.unsplash.com/photo-1544022613-e87ca75a784a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
        rating: "4.1",
        reviewCount: 156,
        stock: 75,
        tags: ["denim", "jacket", "vintage"],
      },
      {
        name: "Floral Summer Dress - Perfect for Vacation",
        description: "Beautiful floral summer dress with lightweight fabric perfect for warm weather.",
        price: "39.99",
        categoryId: 2,
        sellerId: 1,
        images: ["https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
        rating: "4.6",
        reviewCount: 203,
        stock: 45,
        tags: ["dress", "summer", "floral"],
        isFeatured: true,
      },
      {
        name: "Premium Cotton T-Shirt",
        description: "High-quality cotton t-shirt with comfortable fit and durable construction.",
        price: "24.99",
        categoryId: 2,
        sellerId: 1,
        images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
        rating: "4.3",
        reviewCount: 89,
        stock: 100,
        tags: ["t-shirt", "cotton", "casual"],
      },
      {
        name: "Designer Handbag",
        description: "Elegant designer handbag with premium leather and sophisticated styling.",
        price: "199.99",
        categoryId: 2,
        sellerId: 1,
        images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
        rating: "4.8",
        reviewCount: 67,
        stock: 20,
        tags: ["handbag", "designer", "leather"],
      },
      {
        name: "Running Sneakers",
        description: "High-performance running sneakers with advanced cushioning and breathable design.",
        price: "149.99",
        categoryId: 2,
        sellerId: 1,
        images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
        rating: "4.5",
        reviewCount: 234,
        stock: 55,
        tags: ["sneakers", "running", "sports"],
      },
      {
        name: "Business Blazer",
        description: "Professional business blazer with tailored fit and premium fabric.",
        price: "259.99",
        categoryId: 2,
        sellerId: 1,
        images: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
        rating: "4.4",
        reviewCount: 45,
        stock: 25,
        tags: ["blazer", "business", "formal"],
      },

      // Home & Garden
      {
        name: "Modern Table Lamp - Minimalist Design",
        description: "Elegant modern table lamp with minimalist design and warm LED lighting.",
        price: "79.99",
        categoryId: 3,
        sellerId: 1,
        images: ["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
        rating: "4.2",
        reviewCount: 78,
        stock: 35,
        tags: ["lamp", "modern", "minimalist"],
      },
      {
        name: "Abstract Wall Art Canvas Print Set",
        description: "Beautiful set of abstract canvas prints to enhance your home decor.",
        price: "129.99",
        categoryId: 3,
        sellerId: 1,
        images: ["https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
        rating: "4.7",
        reviewCount: 134,
        stock: 40,
        tags: ["wall-art", "canvas", "abstract"],
        isFeatured: true,
      },
      {
        name: "Decorative Throw Pillows",
        description: "Set of decorative throw pillows with premium fabric and stylish patterns.",
        price: "39.99",
        categoryId: 3,
        sellerId: 1,
        images: ["https://images.unsplash.com/photo-1549497538-303791108f95?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
        rating: "4.5",
        reviewCount: 167,
        stock: 80,
        tags: ["pillows", "decorative", "home"],
      },
      {
        name: "Indoor Plant Collection",
        description: "Beautiful collection of indoor plants perfect for home decoration and air purification.",
        price: "49.99",
        categoryId: 3,
        sellerId: 1,
        images: ["https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
        rating: "4.6",
        reviewCount: 145,
        stock: 30,
        tags: ["plants", "indoor", "decoration"],
      },
      {
        name: "Cozy Throw Blanket",
        description: "Ultra-soft throw blanket perfect for relaxing evenings and cold weather.",
        price: "59.99",
        categoryId: 3,
        sellerId: 1,
        images: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
        rating: "4.8",
        reviewCount: 89,
        stock: 60,
        tags: ["blanket", "cozy", "soft"],
      },
      {
        name: "Modern Sectional Sofa",
        description: "Comfortable modern sectional sofa with premium upholstery and contemporary design.",
        price: "899.99",
        categoryId: 3,
        sellerId: 1,
        images: ["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
        rating: "4.3",
        reviewCount: 56,
        stock: 8,
        tags: ["sofa", "sectional", "modern"],
      },

      // Kitchen
      {
        name: "Professional Coffee Machine - Espresso Maker",
        description: "High-end espresso machine with professional-grade features and premium build quality.",
        price: "299.99",
        categoryId: 6,
        sellerId: 1,
        images: ["https://images.unsplash.com/photo-1497515114629-f71d768fd07c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
        rating: "4.4",
        reviewCount: 312,
        stock: 15,
        tags: ["coffee", "espresso", "professional"],
        isFeatured: true,
      },
      {
        name: "High-Speed Blender",
        description: "Powerful high-speed blender perfect for smoothies, soups, and food preparation.",
        price: "149.99",
        categoryId: 6,
        sellerId: 1,
        images: ["https://images.unsplash.com/photo-1570197788417-0e82375c9371?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
        rating: "4.2",
        reviewCount: 234,
        stock: 25,
        tags: ["blender", "smoothies", "kitchen"],
      },
      {
        name: "Non-Stick Cookware Set",
        description: "Complete non-stick cookware set with premium coating and ergonomic handles.",
        price: "199.99",
        categoryId: 6,
        sellerId: 1,
        images: ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
        rating: "4.6",
        reviewCount: 178,
        stock: 20,
        tags: ["cookware", "non-stick", "set"],
      },
      {
        name: "Professional Stand Mixer",
        description: "Heavy-duty stand mixer with powerful motor and multiple attachments for baking.",
        price: "349.99",
        categoryId: 6,
        sellerId: 1,
        images: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
        rating: "4.8",
        reviewCount: 89,
        stock: 12,
        tags: ["mixer", "baking", "professional"],
      },

      // Sports
      {
        name: "Premium Yoga Mat - Non-Slip Eco-Friendly",
        description: "High-quality yoga mat with non-slip surface and eco-friendly materials.",
        price: "49.99",
        categoryId: 4,
        sellerId: 1,
        images: ["https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
        rating: "4.7",
        reviewCount: 267,
        stock: 45,
        tags: ["yoga", "mat", "eco-friendly"],
      },
      {
        name: "Adjustable Dumbbell Set",
        description: "Space-saving adjustable dumbbell set perfect for home workouts.",
        price: "199.99",
        categoryId: 4,
        sellerId: 1,
        images: ["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
        rating: "4.3",
        reviewCount: 134,
        stock: 18,
        tags: ["dumbbells", "adjustable", "home-gym"],
      },
      {
        name: "Professional Basketball",
        description: "Official size basketball with premium leather and excellent grip.",
        price: "49.99",
        categoryId: 4,
        sellerId: 1,
        images: ["https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
        rating: "4.5",
        reviewCount: 89,
        stock: 50,
        tags: ["basketball", "professional", "sports"],
      },
      {
        name: "Performance Running Shoes",
        description: "High-performance running shoes with advanced cushioning and support.",
        price: "129.99",
        categoryId: 4,
        sellerId: 1,
        images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
        rating: "4.6",
        reviewCount: 245,
        stock: 35,
        tags: ["running", "shoes", "performance"],
        isFeatured: true,
      },

      // Beauty
      {
        name: "Luxury Skincare Set - Anti-Aging Formula",
        description: "Premium anti-aging skincare set with natural ingredients and proven results.",
        price: "159.99",
        categoryId: 5,
        sellerId: 1,
        images: ["https://images.unsplash.com/photo-1556228720-195a672e8a03?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
        rating: "4.4",
        reviewCount: 189,
        stock: 25,
        tags: ["skincare", "anti-aging", "luxury"],
      },
      {
        name: "Professional Makeup Palette",
        description: "Complete makeup palette with high-quality pigments and versatile shades.",
        price: "89.99",
        categoryId: 5,
        sellerId: 1,
        images: ["https://images.unsplash.com/photo-1512496015851-a90fb38ba796?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
        rating: "4.2",
        reviewCount: 156,
        stock: 40,
        tags: ["makeup", "palette", "professional"],
      },
      {
        name: "Hair Care Treatment Set",
        description: "Complete hair care treatment set for healthy, shiny hair.",
        price: "79.99",
        categoryId: 5,
        sellerId: 1,
        images: ["https://images.unsplash.com/photo-1571781926291-c477ebfd024b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
        rating: "4.5",
        reviewCount: 123,
        stock: 30,
        tags: ["hair-care", "treatment", "shiny"],
      },
      {
        name: "Luxury Fragrance Collection",
        description: "Exquisite collection of luxury fragrances with unique and captivating scents.",
        price: "199.99",
        categoryId: 5,
        sellerId: 1,
        images: ["https://images.unsplash.com/photo-1541643600914-78b084683601?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
        rating: "4.7",
        reviewCount: 78,
        stock: 15,
        tags: ["fragrance", "luxury", "collection"],
        isFeatured: true,
      },
    ];

    productsData.forEach(prod => {
      const product: Product = {
        id: this.currentProductId++,
        name: prod.name,
        description: prod.description,
        price: prod.price,
        originalPrice: prod.originalPrice || null,
        categoryId: prod.categoryId,
        sellerId: prod.sellerId,
        images: prod.images,
        rating: prod.rating || null,
        reviewCount: prod.reviewCount || 0,
        stock: prod.stock,
        tags: prod.tags || null,
        isActive: true,
        isFeatured: prod.isFeatured || false,
        specifications: prod.specifications || null,
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
  async getProducts(filters?: {
    categoryId?: number;
    sellerId?: number;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
    limit?: number;
    offset?: number;
  }): Promise<Product[]> {
    let products = Array.from(this.products.values()).filter(p => p.isActive);

    if (filters?.categoryId) {
      products = products.filter(p => p.categoryId === filters.categoryId);
    }

    if (filters?.sellerId) {
      products = products.filter(p => p.sellerId === filters.sellerId);
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(search) || 
        p.description.toLowerCase().includes(search)
      );
    }

    if (filters?.minPrice) {
      products = products.filter(p => parseFloat(p.price) >= filters.minPrice!);
    }

    if (filters?.maxPrice) {
      products = products.filter(p => parseFloat(p.price) <= filters.maxPrice!);
    }

    // Sort products
    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case 'price_asc':
          products.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
          break;
        case 'price_desc':
          products.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
          break;
        case 'rating':
          products.sort((a, b) => parseFloat(b.rating || "0") - parseFloat(a.rating || "0"));
          break;
        case 'newest':
          products.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
          break;
      }
    }

    // Pagination
    const offset = filters?.offset || 0;
    const limit = filters?.limit || products.length;
    return products.slice(offset, offset + limit);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const product: Product = {
      id: this.currentProductId++,
      ...insertProduct,
      rating: "0",
      reviewCount: 0,
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
    // Check if item already exists in cart
    const existingItem = Array.from(this.cartItems.values()).find(
      item => item.userId === insertCartItem.userId && item.productId === insertCartItem.productId
    );

    if (existingItem) {
      existingItem.quantity += (insertCartItem.quantity ?? 1);
      this.cartItems.set(existingItem.id, existingItem);
      return existingItem;
    }

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
    const userCartItems = Array.from(this.cartItems.entries()).filter(([_, item]) => item.userId === userId);
    userCartItems.forEach(([id]) => this.cartItems.delete(id));
    return true;
  }

  // Order methods
  async getOrders(userId?: number): Promise<Order[]> {
    const orders = Array.from(this.orders.values());
    return userId ? orders.filter(order => order.userId === userId) : orders;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(insertOrder: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const order: Order = {
      id: this.currentOrderId++,
      ...insertOrder,
      createdAt: new Date(),
    };
    this.orders.set(order.id, order);

    // Create order items
    items.forEach(item => {
      const orderItem: OrderItem = {
        id: this.currentOrderItemId++,
        orderId: order.id,
        ...item,
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
      ...insertReview,
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
      ...insertWishlistItem,
      createdAt: new Date(),
    };
    this.wishlist.set(wishlistItem.id, wishlistItem);
    return wishlistItem;
  }

  async removeFromWishlist(userId: number, productId: number): Promise<boolean> {
    const item = Array.from(this.wishlist.entries()).find(
      ([_, item]) => item.userId === userId && item.productId === productId
    );
    if (item) {
      return this.wishlist.delete(item[0]);
    }
    return false;
  }
}

export const storage = new MemStorage();
