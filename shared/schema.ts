import { pgTable, text, serial, integer, boolean, decimal, timestamp, varchar, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication and role management
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 100 }).unique(),
  password: text("password").notNull(),
  role: varchar("role", { length: 20 }).notNull().default("cashier"), // admin, pharmacist, cashier
  firstName: varchar("first_name", { length: 50 }),
  lastName: varchar("last_name", { length: 50 }),
  profileImageUrl: text("profile_image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Drug categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow()
});

// Suppliers
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  contactPerson: varchar("contact_person", { length: 100 }),
  email: varchar("email", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

// Customers
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  dateOfBirth: timestamp("date_of_birth"),
  createdAt: timestamp("created_at").defaultNow()
});

// Drugs/Products
export const drugs = pgTable("drugs", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  genericName: varchar("generic_name", { length: 100 }),
  brand: varchar("brand", { length: 100 }),
  categoryId: integer("category_id").references(() => categories.id),
  dosage: varchar("dosage", { length: 50 }),
  form: varchar("form", { length: 50 }), // tablet, capsule, syrup, etc.
  description: text("description"),
  barcode: varchar("barcode", { length: 50 }).unique(),
  requiresPrescription: boolean("requires_prescription").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

// Drug batches for inventory tracking
export const drugBatches = pgTable("drug_batches", {
  id: serial("id").primaryKey(),
  drugId: integer("drug_id").notNull().references(() => drugs.id),
  batchNumber: varchar("batch_number", { length: 50 }).notNull(),
  expiryDate: timestamp("expiry_date").notNull(),
  quantity: integer("quantity").notNull(),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }).notNull(),
  sellingPrice: decimal("selling_price", { precision: 10, scale: 2 }).notNull(),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  createdAt: timestamp("created_at").defaultNow()
});

// Sales transactions
export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  receiptNumber: varchar("receipt_number", { length: 50 }).notNull().unique(),
  customerId: integer("customer_id").references(() => customers.id),
  customerName: varchar("customer_name", { length: 255 }),
  customerPhone: varchar("customer_phone", { length: 20 }),
  userId: integer("user_id").notNull().references(() => users.id),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).notNull(),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default('0'),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 20 }).notNull(), // cash, card, mpesa
  status: varchar("status", { length: 20 }).default("completed"), // completed, refunded, cancelled
  createdAt: timestamp("created_at").defaultNow()
});

// Sale items
export const saleItems = pgTable("sale_items", {
  id: serial("id").primaryKey(),
  saleId: integer("sale_id").notNull().references(() => sales.id),
  drugBatchId: integer("drug_batch_id").notNull().references(() => drugBatches.id),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull()
});

// Purchase orders
export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  purchaseNumber: varchar("purchase_number", { length: 50 }).notNull().unique(),
  supplierId: integer("supplier_id").notNull().references(() => suppliers.id),
  userId: integer("user_id").notNull().references(() => users.id),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending"), // pending, received, cancelled
  orderDate: timestamp("order_date").defaultNow(),
  receivedDate: timestamp("received_date")
});

// Purchase items
export const purchaseItems = pgTable("purchase_items", {
  id: serial("id").primaryKey(),
  purchaseId: integer("purchase_id").notNull().references(() => purchases.id),
  drugId: integer("drug_id").notNull().references(() => drugs.id),
  quantity: integer("quantity").notNull(),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }).notNull(),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).notNull(),
  batchNumber: varchar("batch_number", { length: 50 }).notNull(),
  expiryDate: timestamp("expiry_date").notNull()
});

// System settings
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sales: many(sales),
  purchases: many(purchases)
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  drugs: many(drugs)
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  drugBatches: many(drugBatches),
  purchases: many(purchases)
}));

export const customersRelations = relations(customers, ({ many }) => ({
  sales: many(sales)
}));

export const drugsRelations = relations(drugs, ({ one, many }) => ({
  category: one(categories, {
    fields: [drugs.categoryId],
    references: [categories.id]
  }),
  batches: many(drugBatches),
  purchaseItems: many(purchaseItems)
}));

export const drugBatchesRelations = relations(drugBatches, ({ one, many }) => ({
  drug: one(drugs, {
    fields: [drugBatches.drugId],
    references: [drugs.id]
  }),
  supplier: one(suppliers, {
    fields: [drugBatches.supplierId],
    references: [suppliers.id]
  }),
  saleItems: many(saleItems)
}));

export const salesRelations = relations(sales, ({ one, many }) => ({
  customer: one(customers, {
    fields: [sales.customerId],
    references: [customers.id]
  }),
  user: one(users, {
    fields: [sales.userId],
    references: [users.id]
  }),
  items: many(saleItems)
}));

export const saleItemsRelations = relations(saleItems, ({ one }) => ({
  sale: one(sales, {
    fields: [saleItems.saleId],
    references: [sales.id]
  }),
  drugBatch: one(drugBatches, {
    fields: [saleItems.drugBatchId],
    references: [drugBatches.id]
  })
}));

export const purchasesRelations = relations(purchases, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [purchases.supplierId],
    references: [suppliers.id]
  }),
  user: one(users, {
    fields: [purchases.userId],
    references: [users.id]
  }),
  items: many(purchaseItems)
}));

export const purchaseItemsRelations = relations(purchaseItems, ({ one }) => ({
  purchase: one(purchases, {
    fields: [purchaseItems.purchaseId],
    references: [purchases.id]
  }),
  drug: one(drugs, {
    fields: [purchaseItems.drugId],
    references: [drugs.id]
  })
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true
});

export const insertDrugSchema = createInsertSchema(drugs).omit({
  id: true,
  createdAt: true
});

export const insertDrugBatchSchema = createInsertSchema(drugBatches).omit({
  id: true,
  createdAt: true
});

export const insertSaleSchema = createInsertSchema(sales).omit({
  id: true,
  createdAt: true
});

export const insertSaleItemSchema = createInsertSchema(saleItems).omit({
  id: true
});

export const insertPurchaseSchema = createInsertSchema(purchases).omit({
  id: true,
  orderDate: true,
  receivedDate: true
});

export const insertPurchaseItemSchema = createInsertSchema(purchaseItems).omit({
  id: true
});

export const insertSettingSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Drug = typeof drugs.$inferSelect;
export type InsertDrug = z.infer<typeof insertDrugSchema>;

export type DrugBatch = typeof drugBatches.$inferSelect;
export type InsertDrugBatch = z.infer<typeof insertDrugBatchSchema>;

export type Sale = typeof sales.$inferSelect;
export type InsertSale = z.infer<typeof insertSaleSchema>;

export type SaleItem = typeof saleItems.$inferSelect;
export type InsertSaleItem = z.infer<typeof insertSaleItemSchema>;

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;

export type PurchaseItem = typeof purchaseItems.$inferSelect;
export type InsertPurchaseItem = z.infer<typeof insertPurchaseItemSchema>;

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;
