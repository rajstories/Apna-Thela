import { 
  type Supplier, 
  type InsertSupplier,
  type InventoryItem,
  type InsertInventoryItem,
  type UserPreferences,
  type InsertUserPreferences,
  type SupplierProduct,
  type InsertSupplierProduct,
  type Order,
  type InsertOrder,
  type CartItem,
  type InsertCartItem,
  type StockUpdate,
  type InsertStockUpdate,
  suppliers,
  inventoryItems,
  userPreferences,
  supplierProducts,
  orders,
  cartItems,
  stockUpdates
} from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // Suppliers
  getSuppliers(): Promise<Supplier[]>;
  getSuppliersByCategory(category: string): Promise<Supplier[]>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  
  // Supplier Products (B2B Marketplace)
  getSupplierProducts(): Promise<(SupplierProduct & { supplier: Supplier })[]>;
  getSupplierProductsByCategory(category: string): Promise<(SupplierProduct & { supplier: Supplier })[]>;
  getSupplierProductsForSupplier(supplierId: string): Promise<SupplierProduct[]>;
  createSupplierProduct(product: InsertSupplierProduct): Promise<SupplierProduct>;
  
  // Cart Management
  getCartItems(): Promise<(CartItem & { product: SupplierProduct & { supplier: Supplier } })[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: string): Promise<void>;
  clearCart(): Promise<void>;
  
  // Orders
  getOrders(): Promise<(Order & { supplier: Supplier })[]>;
  getRecentOrders(): Promise<(Order & { supplier: Supplier })[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  
  // Inventory
  getInventoryItems(): Promise<InventoryItem[]>;
  getInventoryItem(id: string): Promise<InventoryItem | undefined>;
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem | undefined>;
  getLowStockItems(): Promise<InventoryItem[]>;
  
  // Stock Updates & Analytics
  createStockUpdate(update: InsertStockUpdate): Promise<StockUpdate>;
  getStockUpdates(inventoryItemId: string): Promise<StockUpdate[]>;
  getStockUsageData(inventoryItemId: string, days: number): Promise<StockUpdate[]>;
  
  // User Preferences
  getUserPreferences(): Promise<UserPreferences | undefined>;
  updateUserPreferences(preferences: Partial<InsertUserPreferences>): Promise<UserPreferences>;
}

export class MemStorage implements IStorage {
  private suppliers: Map<string, Supplier>;
  private inventoryItems: Map<string, InventoryItem>;
  private userPreferences: UserPreferences | undefined;

  constructor() {
    this.suppliers = new Map();
    this.inventoryItems = new Map();
    this.userPreferences = undefined;
    
    // Initialize with some sample data for demo
    this.initializeData();
  }

  private initializeData() {
    // Sample suppliers
    const sampleSuppliers = [
      {
        id: randomUUID(),
        name: "Fresh Vegetables Mart",
        nameHi: "ताज़ी सब्जी मार्ट",
        nameBn: "তাজা সবজি মার্ট",
        category: "vegetables",
        phone: "+91 98765 43210",
        address: "Local Market, Sector 15",
        rating: "4.5",
        isActive: true,
      },
      {
        id: randomUUID(),
        name: "Spice World",
        nameHi: "मसाला वर्ल्ड",
        nameBn: "মসলা ওয়ার্ল্ড",
        category: "spices",
        phone: "+91 98765 43211",
        address: "Spice Market, Old City",
        rating: "4.8",
        isActive: true,
      },
      {
        id: randomUUID(),
        name: "Oil & Grains Co.",
        nameHi: "तेल और अनाज कंपनी",
        nameBn: "তেল ও শস্য কোম্পানি",
        category: "oil",
        phone: "+91 98765 43212",
        address: "Wholesale Market",
        rating: "4.2",
        isActive: true,
      }
    ];

    sampleSuppliers.forEach(supplier => {
      this.suppliers.set(supplier.id, supplier);
    });

    // Sample inventory items
    const sampleInventory = [
      {
        id: randomUUID(),
        name: "Potatoes",
        nameHi: "आलू",
        nameBn: "আলু",
        category: "vegetables",
        quantity: 25,
        unit: "kg",
        minThreshold: 10,
        pricePerUnit: "15.00",
        lastUpdated: new Date(),
      },
      {
        id: randomUUID(),
        name: "Onions",
        nameHi: "प्याज",
        nameBn: "পিঁয়াজ",
        category: "vegetables",
        quantity: 8,
        unit: "kg",
        minThreshold: 15,
        pricePerUnit: "20.00",
        lastUpdated: new Date(),
      },
      {
        id: randomUUID(),
        name: "Turmeric Powder",
        nameHi: "हल्दी पाउडर",
        nameBn: "হলুদ গুঁড়া",
        category: "spices",
        quantity: 3,
        unit: "kg",
        minThreshold: 2,
        pricePerUnit: "150.00",
        lastUpdated: new Date(),
      }
    ];

    sampleInventory.forEach(item => {
      this.inventoryItems.set(item.id, item);
    });

    // Default user preferences
    this.userPreferences = {
      id: randomUUID(),
      language: "hi",
      voiceEnabled: true,
      lowStockAlerts: true,
    };
  }

  async getSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliers.values()).filter(s => s.isActive);
  }

  async getSuppliersByCategory(category: string): Promise<Supplier[]> {
    return Array.from(this.suppliers.values()).filter(
      s => s.category === category && s.isActive
    );
  }

  async createSupplier(insertSupplier: InsertSupplier): Promise<Supplier> {
    const id = randomUUID();
    const supplier: Supplier = { 
      ...insertSupplier, 
      id,
      nameHi: insertSupplier.nameHi || null,
      nameBn: insertSupplier.nameBn || null,
      phone: insertSupplier.phone || null,
      address: insertSupplier.address || null,
      rating: insertSupplier.rating || "0.0",
      isActive: insertSupplier.isActive !== undefined ? insertSupplier.isActive : true
    };
    this.suppliers.set(id, supplier);
    return supplier;
  }

  async getInventoryItems(): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItems.values());
  }

  async getInventoryItem(id: string): Promise<InventoryItem | undefined> {
    return this.inventoryItems.get(id);
  }

  async createInventoryItem(insertItem: InsertInventoryItem): Promise<InventoryItem> {
    const id = randomUUID();
    const item: InventoryItem = { 
      ...insertItem, 
      id,
      nameHi: insertItem.nameHi || null,
      nameBn: insertItem.nameBn || null,
      quantity: insertItem.quantity || 0,
      minThreshold: insertItem.minThreshold || 5,
      pricePerUnit: insertItem.pricePerUnit || "0.00",
      lastUpdated: new Date()
    };
    this.inventoryItems.set(id, item);
    return item;
  }

  async updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem | undefined> {
    const item = this.inventoryItems.get(id);
    if (!item) return undefined;
    
    const updatedItem = { 
      ...item, 
      ...updates, 
      lastUpdated: new Date()
    };
    this.inventoryItems.set(id, updatedItem);
    return updatedItem;
  }

  async getLowStockItems(): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItems.values()).filter(
      item => (item.quantity || 0) <= (item.minThreshold || 5)
    );
  }

  async getUserPreferences(): Promise<UserPreferences | undefined> {
    return this.userPreferences;
  }

  async updateUserPreferences(preferences: Partial<InsertUserPreferences>): Promise<UserPreferences> {
    if (!this.userPreferences) {
      this.userPreferences = {
        id: randomUUID(),
        language: "hi",
        voiceEnabled: true,
        lowStockAlerts: true,
        ...preferences,
      };
    } else {
      this.userPreferences = {
        ...this.userPreferences,
        ...preferences,
      };
    }
    return this.userPreferences;
  }
}

export class DatabaseStorage implements IStorage {
  async getSuppliers(): Promise<Supplier[]> {
    const result = await db.select().from(suppliers).where(eq(suppliers.isActive, true));
    return result;
  }

  async getSuppliersByCategory(category: string): Promise<Supplier[]> {
    const result = await db.select().from(suppliers)
      .where(eq(suppliers.category, category));
    return result.filter(supplier => supplier.isActive);
  }

  async createSupplier(insertSupplier: InsertSupplier): Promise<Supplier> {
    const [supplier] = await db.insert(suppliers).values(insertSupplier).returning();
    return supplier;
  }

  async getSupplierProducts(): Promise<(SupplierProduct & { supplier: Supplier })[]> {
    const result = await db
      .select()
      .from(supplierProducts)
      .leftJoin(suppliers, eq(supplierProducts.supplierId, suppliers.id))
      .where(eq(supplierProducts.availability, true));
    
    return result.map(row => ({
      ...row.supplier_products!,
      supplier: row.suppliers!
    }));
  }

  async getSupplierProductsByCategory(category: string): Promise<(SupplierProduct & { supplier: Supplier })[]> {
    const result = await db
      .select()
      .from(supplierProducts)
      .leftJoin(suppliers, eq(supplierProducts.supplierId, suppliers.id))
      .where(eq(supplierProducts.category, category));
    
    return result.map(row => ({
      ...row.supplier_products!,
      supplier: row.suppliers!
    }));
  }

  async getSupplierProductsForSupplier(supplierId: string): Promise<SupplierProduct[]> {
    return await db
      .select()
      .from(supplierProducts)
      .where(eq(supplierProducts.supplierId, supplierId));
  }

  async createSupplierProduct(product: InsertSupplierProduct): Promise<SupplierProduct> {
    const [created] = await db
      .insert(supplierProducts)
      .values(product)
      .returning();
    return created;
  }

  async getCartItems(): Promise<(CartItem & { product: SupplierProduct & { supplier: Supplier } })[]> {
    const result = await db
      .select()
      .from(cartItems)
      .leftJoin(supplierProducts, eq(cartItems.productId, supplierProducts.id))
      .leftJoin(suppliers, eq(supplierProducts.supplierId, suppliers.id));
    
    return result.map(row => ({
      ...row.cart_items!,
      product: {
        ...row.supplier_products!,
        supplier: row.suppliers!
      }
    }));
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const [existing] = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.productId, item.productId));

    if (existing) {
      // Update quantity if item exists
      const [updated] = await db
        .update(cartItems)
        .set({ quantity: existing.quantity + item.quantity })
        .where(eq(cartItems.id, existing.id))
        .returning();
      return updated;
    } else {
      // Add new item to cart
      const [created] = await db
        .insert(cartItems)
        .values(item)
        .returning();
      return created;
    }
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem | undefined> {
    const [updated] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updated || undefined;
  }

  async removeFromCart(id: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(): Promise<void> {
    await db.delete(cartItems);
  }

  async getOrders(): Promise<(Order & { supplier: Supplier })[]> {
    const result = await db
      .select()
      .from(orders)
      .leftJoin(suppliers, eq(orders.supplierId, suppliers.id))
      .orderBy(orders.orderDate);
    
    return result.map(row => ({
      ...row.orders!,
      supplier: row.suppliers!
    }));
  }

  async getRecentOrders(): Promise<(Order & { supplier: Supplier })[]> {
    const result = await db
      .select()
      .from(orders)
      .leftJoin(suppliers, eq(orders.supplierId, suppliers.id))
      .orderBy(orders.orderDate)
      .limit(10);
    
    return result.map(row => ({
      ...row.orders!,
      supplier: row.suppliers!
    }));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [created] = await db
      .insert(orders)
      .values(order)
      .returning();
    return created;
  }

  async getInventoryItems(): Promise<InventoryItem[]> {
    const result = await db.select().from(inventoryItems);
    return result;
  }

  async getInventoryItem(id: string): Promise<InventoryItem | undefined> {
    const [item] = await db.select().from(inventoryItems).where(eq(inventoryItems.id, id));
    return item || undefined;
  }

  async createInventoryItem(insertItem: InsertInventoryItem): Promise<InventoryItem> {
    const [item] = await db.insert(inventoryItems).values(insertItem).returning();
    return item;
  }

  async updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem | undefined> {
    const [item] = await db.update(inventoryItems)
      .set({ ...updates, lastUpdated: new Date() })
      .where(eq(inventoryItems.id, id))
      .returning();
    return item || undefined;
  }

  async getLowStockItems(): Promise<InventoryItem[]> {
    const result = await db.select().from(inventoryItems);
    return result.filter(item => (item.quantity || 0) <= (item.minThreshold || 5));
  }

  // Stock Updates & Analytics
  async createStockUpdate(update: InsertStockUpdate): Promise<StockUpdate> {
    const [newUpdate] = await db.insert(stockUpdates).values(update).returning();
    return newUpdate;
  }

  async getStockUpdates(inventoryItemId: string): Promise<StockUpdate[]> {
    return await db
      .select()
      .from(stockUpdates)
      .where(eq(stockUpdates.inventoryItemId, inventoryItemId))
      .orderBy(sql`${stockUpdates.createdAt} DESC`);
  }

  async getStockUsageData(inventoryItemId: string, days: number): Promise<StockUpdate[]> {
    return await db
      .select()
      .from(stockUpdates)
      .where(sql`
        ${stockUpdates.inventoryItemId} = ${inventoryItemId} 
        AND ${stockUpdates.createdAt} >= NOW() - INTERVAL '${days} days'
      `)
      .orderBy(sql`${stockUpdates.createdAt} ASC`);
  }

  async getUserPreferences(): Promise<UserPreferences | undefined> {
    const [prefs] = await db.select().from(userPreferences).limit(1);
    return prefs || undefined;
  }

  async updateUserPreferences(preferences: Partial<InsertUserPreferences>): Promise<UserPreferences> {
    const existing = await this.getUserPreferences();
    
    if (!existing) {
      const [newPrefs] = await db.insert(userPreferences).values({
        language: preferences.language || "hi",
        voiceEnabled: preferences.voiceEnabled !== undefined ? preferences.voiceEnabled : true,
        lowStockAlerts: preferences.lowStockAlerts !== undefined ? preferences.lowStockAlerts : true,
      }).returning();
      return newPrefs;
    } else {
      const [updatedPrefs] = await db.update(userPreferences)
        .set(preferences)
        .where(eq(userPreferences.id, existing.id))
        .returning();
      return updatedPrefs;
    }
  }
}

export const storage = new DatabaseStorage();
