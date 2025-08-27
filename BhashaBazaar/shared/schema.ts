import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const suppliers = pgTable("suppliers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nameHi: text("name_hi"),
  nameBn: text("name_bn"),
  category: text("category").notNull(),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0.0"),
  verified: boolean("verified").default(false),
  deliveryTime: text("delivery_time"), // "1-2 days", "Same day", etc.
  minOrderAmount: decimal("min_order_amount", { precision: 10, scale: 2 }).default("0.00"),
  isActive: boolean("is_active").default(true),
});

export const supplierProducts = pgTable("supplier_products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supplierId: varchar("supplier_id").notNull().references(() => suppliers.id),
  productName: text("product_name").notNull(),
  productNameHi: text("product_name_hi"),
  productNameBn: text("product_name_bn"),
  category: text("category").notNull(),
  unit: text("unit").notNull(), // kg, liters, pieces
  pricePerUnit: decimal("price_per_unit", { precision: 10, scale: 2 }).notNull(),
  availability: boolean("availability").default(true),
  description: text("description"),
  onlineStoreUrl: text("online_store_url"), // URL to buy this product online
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supplierId: varchar("supplier_id").notNull().references(() => suppliers.id),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, confirmed, delivered, cancelled
  orderDate: timestamp("order_date").defaultNow(),
  deliveryDate: timestamp("delivery_date"),
  items: text("items").notNull(), // JSON string of order items
});

export const cartItems = pgTable("cart_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => supplierProducts.id),
  quantity: integer("quantity").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const inventoryItems = pgTable("inventory_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nameHi: text("name_hi"),
  nameBn: text("name_bn"),
  category: text("category").notNull(),
  quantity: integer("quantity").default(0),
  unit: text("unit").notNull(), // kg, pieces, liters, etc.
  minThreshold: integer("min_threshold").default(5),
  pricePerUnit: decimal("price_per_unit", { precision: 10, scale: 2 }),
  stockStatus: text("stock_status").default("full"), // "full", "low", "empty"
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const stockUpdates = pgTable("stock_updates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  inventoryItemId: varchar("inventory_item_id").notNull().references(() => inventoryItems.id),
  previousQuantity: integer("previous_quantity").notNull(),
  newQuantity: integer("new_quantity").notNull(),
  changeType: text("change_type").notNull(), // "manual_entry", "usage", "restock"
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userPreferences = pgTable("user_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  language: text("language").notNull().default("hi"),
  voiceEnabled: boolean("voice_enabled").default(true),
  lowStockAlerts: boolean("low_stock_alerts").default(true),
});

export const creditTracker = pgTable("credit_tracker", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id"), // Could link to vendor_profiles if needed
  creditLimit: decimal("credit_limit", { precision: 10, scale: 2 }).notNull().default("5000.00"),
  creditUsed: decimal("credit_used", { precision: 10, scale: 2 }).notNull().default("0.00"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const purchases = pgTable("purchases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => orders.id),
  supplierName: text("supplier_name").notNull(),
  itemName: text("item_name").notNull(),
  quantity: integer("quantity").notNull(),
  unit: text("unit").notNull(),
  pricePerUnit: decimal("price_per_unit", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentStatus: text("payment_status").notNull().default("pending"), // pending, paid, failed
  upiTransactionId: text("upi_transaction_id"),
  purchaseDate: timestamp("purchase_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const groupOrders = pgTable("group_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  createdBy: text("created_by").notNull(), // vendor name who created
  supplierName: text("supplier_name").notNull(),
  itemName: text("item_name").notNull(),
  unit: text("unit").notNull(),
  targetQuantity: integer("target_quantity").notNull(),
  currentQuantity: integer("current_quantity").default(0),
  pricePerUnit: decimal("price_per_unit", { precision: 10, scale: 2 }).notNull(),
  discountedPrice: decimal("discounted_price", { precision: 10, scale: 2 }).notNull(),
  area: text("area").notNull(), // location area
  timeWindow: text("time_window").notNull(), // e.g., "9-11am"
  status: text("status").notNull().default("active"), // active, completed, expired
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const groupOrderParticipants = pgTable("group_order_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupOrderId: varchar("group_order_id").references(() => groupOrders.id),
  vendorName: text("vendor_name").notNull(),
  quantity: integer("quantity").notNull(),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Price comparison suppliers table for real market data
export const priceComparisonSuppliers = pgTable("price_comparison_suppliers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  location: text("location").notNull(),
  pincode: varchar("pincode", { length: 10 }).notNull(),
  phone: varchar("phone", { length: 15 }).notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).notNull(),
  trustedByCount: integer("trusted_by_count").default(0),
  isVerified: boolean("is_verified").default(false),
  speciality: text("speciality"),
  whatsappNumber: varchar("whatsapp_number", { length: 15 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Raw material prices from suppliers
export const supplierPrices = pgTable("supplier_prices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supplierId: varchar("supplier_id").references(() => priceComparisonSuppliers.id).notNull(),
  itemName: text("item_name").notNull(),
  itemNameHi: text("item_name_hi"),
  pricePerKg: decimal("price_per_kg", { precision: 10, scale: 2 }).notNull(),
  unit: text("unit").default("kg"),
  availability: boolean("availability").default(true),
  lastUpdated: timestamp("last_updated").defaultNow(),
  category: text("category").notNull(),
});

export const insertSupplierSchema = createInsertSchema(suppliers).pick({
  name: true,
  nameHi: true,
  nameBn: true,
  category: true,
  phone: true,
  address: true,
  rating: true,
  isActive: true,
});

export const insertInventoryItemSchema = createInsertSchema(inventoryItems).pick({
  name: true,
  nameHi: true,
  nameBn: true,
  category: true,
  quantity: true,
  unit: true,
  minThreshold: true,
  pricePerUnit: true,
});

export const insertStockUpdateSchema = createInsertSchema(stockUpdates).pick({
  inventoryItemId: true,
  previousQuantity: true,
  newQuantity: true,
  changeType: true,
  notes: true,
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).pick({
  language: true,
  voiceEnabled: true,
  lowStockAlerts: true,
});

export const insertSupplierProductSchema = createInsertSchema(supplierProducts).omit({
  id: true,
  lastUpdated: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  orderDate: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
});

export const insertPurchaseSchema = createInsertSchema(purchases).omit({
  id: true,
  createdAt: true,
});

export const insertGroupOrderSchema = createInsertSchema(groupOrders).omit({
  id: true,
  createdAt: true,
});

export const insertGroupOrderParticipantSchema = createInsertSchema(groupOrderParticipants).omit({
  id: true,
  joinedAt: true,
});

export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;

export type SupplierProduct = typeof supplierProducts.$inferSelect;
export type InsertSupplierProduct = z.infer<typeof insertSupplierProductSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;
export type InventoryItem = typeof inventoryItems.$inferSelect;

export type InsertStockUpdate = z.infer<typeof insertStockUpdateSchema>;
export type StockUpdate = typeof stockUpdates.$inferSelect;

export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;

export type GroupOrder = typeof groupOrders.$inferSelect;
export type InsertGroupOrder = z.infer<typeof insertGroupOrderSchema>;

export type GroupOrderParticipant = typeof groupOrderParticipants.$inferSelect;
export type InsertGroupOrderParticipant = z.infer<typeof insertGroupOrderParticipantSchema>;

// Vendor Profile Schema
export const vendorProfiles = pgTable("vendor_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").unique(),
  phone: varchar("phone").unique().notNull(),
  vendorName: text("vendor_name"),
  vendorNameHi: text("vendor_name_hi"),
  vendorNameBn: text("vendor_name_bn"),
  vendorNameMr: text("vendor_name_mr"),
  vendorNameTa: text("vendor_name_ta"),
  vendorNameTe: text("vendor_name_te"),
  storeName: text("store_name"),
  storeNameHi: text("store_name_hi"),
  storeNameBn: text("store_name_bn"),
  storeNameMr: text("store_name_mr"),
  storeNameTa: text("store_name_ta"),
  storeNameTe: text("store_name_te"),
  area: text("area"),
  pincode: varchar("pincode", { length: 6 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  trustScore: integer("trust_score").default(0),
  repeatOrdersCount: integer("repeat_orders_count").default(0),
  whatsappNumber: varchar("whatsapp_number"),
  websiteUrl: text("website_url"),
  isPhoneVerified: boolean("is_phone_verified").default(false),
  profileCompleted: boolean("profile_completed").default(false),
  language: text("language").default("hi"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// OTP Verification Schema
export const otpVerifications = pgTable("otp_verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phone: varchar("phone").notNull(),
  otp: varchar("otp", { length: 6 }).notNull(),
  verified: boolean("verified").default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVendorProfileSchema = createInsertSchema(vendorProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOtpVerificationSchema = createInsertSchema(otpVerifications).omit({
  id: true,
  createdAt: true,
});

export type VendorProfile = typeof vendorProfiles.$inferSelect;
export type InsertVendorProfile = z.infer<typeof insertVendorProfileSchema>;

export type OtpVerification = typeof otpVerifications.$inferSelect;
export type InsertOtpVerification = z.infer<typeof insertOtpVerificationSchema>;

export const insertCreditTrackerSchema = createInsertSchema(creditTracker).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

export type CreditTracker = typeof creditTracker.$inferSelect;
export type InsertCreditTracker = z.infer<typeof insertCreditTrackerSchema>;

// Price comparison schemas
export const insertPriceComparisonSupplierSchema = createInsertSchema(priceComparisonSuppliers).omit({
  id: true,
  createdAt: true,
});

export const insertSupplierPriceSchema = createInsertSchema(supplierPrices).omit({
  id: true,
  lastUpdated: true,
});

export type PriceComparisonSupplier = typeof priceComparisonSuppliers.$inferSelect;
export type InsertPriceComparisonSupplier = z.infer<typeof insertPriceComparisonSupplierSchema>;

export type SupplierPrice = typeof supplierPrices.$inferSelect;
export type InsertSupplierPrice = z.infer<typeof insertSupplierPriceSchema>;
