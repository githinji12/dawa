import {
  users, categories, suppliers, customers, drugs, drugBatches, sales, saleItems, purchases, purchaseItems, settings,
  type User, type InsertUser, type Category, type InsertCategory, type Supplier, type InsertSupplier,
  type Customer, type InsertCustomer, type Drug, type InsertDrug, type DrugBatch, type InsertDrugBatch,
  type Sale, type InsertSale, type SaleItem, type InsertSaleItem, type Purchase, type InsertPurchase,
  type PurchaseItem, type InsertPurchaseItem, type Setting, type InsertSetting
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, or, like, lte, gte, sql, count } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  deleteUser(id: number): Promise<void>;
  getUsers(): Promise<User[]>;

  // Category operations
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;

  // Supplier operations
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: number): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier>;
  deleteSupplier(id: number): Promise<void>;

  // Customer operations
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer>;
  deleteCustomer(id: number): Promise<void>;

  // Drug operations
  getDrugs(): Promise<Drug[]>;
  getDrug(id: number): Promise<Drug | undefined>;
  createDrug(drug: InsertDrug): Promise<Drug>;
  updateDrug(id: number, drug: Partial<InsertDrug>): Promise<Drug>;
  deleteDrug(id: number): Promise<void>;
  searchDrugs(query: string): Promise<Drug[]>;

  // Drug batch operations
  getDrugBatches(): Promise<DrugBatch[]>;
  getDrugBatch(id: number): Promise<DrugBatch | undefined>;
  getDrugBatchesByDrug(drugId: number): Promise<DrugBatch[]>;
  createDrugBatch(batch: InsertDrugBatch): Promise<DrugBatch>;
  updateDrugBatch(id: number, batch: Partial<InsertDrugBatch>): Promise<DrugBatch>;
  deleteDrugBatch(id: number): Promise<void>;
  getLowStockBatches(threshold: number): Promise<DrugBatch[]>;
  getExpiringBatches(days: number): Promise<DrugBatch[]>;

  // Sale operations
  getSales(): Promise<Sale[]>;
  getSale(id: number): Promise<Sale | undefined>;
  createSale(sale: InsertSale): Promise<Sale>;
  getSaleItems(saleId: number): Promise<SaleItem[]>;
  createSaleItem(saleItem: InsertSaleItem): Promise<SaleItem>;
  getTodaysSales(): Promise<Sale[]>;
  getSalesByDateRange(startDate: Date, endDate: Date): Promise<Sale[]>;

  // Purchase operations
  getPurchases(): Promise<Purchase[]>;
  getPurchase(id: number): Promise<Purchase | undefined>;
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  updatePurchase(id: number, purchase: Partial<InsertPurchase>): Promise<Purchase>;
  getPurchaseItems(purchaseId: number): Promise<PurchaseItem[]>;
  createPurchaseItem(purchaseItem: InsertPurchaseItem): Promise<PurchaseItem>;

  // Settings operations
  getSettings(): Promise<Setting[]>;
  getSetting(key: string): Promise<Setting | undefined>;
  setSetting(key: string, value: string): Promise<Setting>;

  // Dashboard stats
  getDashboardStats(): Promise<{
    todaysSales: number;
    totalItems: number;
    lowStockCount: number;
    expiringCount: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User> {
    const [updatedUser] = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return updatedUser;
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(asc(users.username));
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.name));
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category> {
    const [updatedCategory] = await db.update(categories).set(category).where(eq(categories.id, id)).returning();
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Supplier operations
  async getSuppliers(): Promise<Supplier[]> {
    return await db.select().from(suppliers).orderBy(asc(suppliers.name));
  }

  async getSupplier(id: number): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    return supplier;
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const [newSupplier] = await db.insert(suppliers).values(supplier).returning();
    return newSupplier;
  }

  async updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier> {
    const [updatedSupplier] = await db.update(suppliers).set(supplier).where(eq(suppliers.id, id)).returning();
    return updatedSupplier;
  }

  async deleteSupplier(id: number): Promise<void> {
    await db.delete(suppliers).where(eq(suppliers.id, id));
  }

  // Customer operations
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(asc(customers.name));
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }

  async updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer> {
    const [updatedCustomer] = await db.update(customers).set(customer).where(eq(customers.id, id)).returning();
    return updatedCustomer;
  }

  async deleteCustomer(id: number): Promise<void> {
    await db.delete(customers).where(eq(customers.id, id));
  }

  // Drug operations
  async getDrugs(): Promise<Drug[]> {
    return await db.select().from(drugs).orderBy(asc(drugs.name));
  }

  async getDrug(id: number): Promise<Drug | undefined> {
    const [drug] = await db.select().from(drugs).where(eq(drugs.id, id));
    return drug;
  }

  async createDrug(drug: InsertDrug): Promise<Drug> {
    const [newDrug] = await db.insert(drugs).values(drug).returning();
    return newDrug;
  }

  async updateDrug(id: number, drug: Partial<InsertDrug>): Promise<Drug> {
    const [updatedDrug] = await db.update(drugs).set(drug).where(eq(drugs.id, id)).returning();
    return updatedDrug;
  }

  async deleteDrug(id: number): Promise<void> {
    await db.delete(drugs).where(eq(drugs.id, id));
  }

  async searchDrugs(query: string): Promise<Drug[]> {
    return await db.select().from(drugs).where(
      or(
        like(drugs.name, `%${query}%`),
        like(drugs.genericName, `%${query}%`),
        like(drugs.brand, `%${query}%`),
        like(drugs.barcode, `%${query}%`)
      )
    );
  }

  // Drug batch operations
  async getDrugBatches(): Promise<DrugBatch[]> {
    return await db.select().from(drugBatches).orderBy(desc(drugBatches.createdAt));
  }

  async getDrugBatch(id: number): Promise<DrugBatch | undefined> {
    const [batch] = await db.select().from(drugBatches).where(eq(drugBatches.id, id));
    return batch;
  }

  async getDrugBatchesByDrug(drugId: number): Promise<DrugBatch[]> {
    return await db.select().from(drugBatches).where(eq(drugBatches.drugId, drugId));
  }

  async createDrugBatch(batch: InsertDrugBatch): Promise<DrugBatch> {
    const [newBatch] = await db.insert(drugBatches).values(batch).returning();
    return newBatch;
  }

  async updateDrugBatch(id: number, batch: Partial<InsertDrugBatch>): Promise<DrugBatch> {
    const [updatedBatch] = await db.update(drugBatches).set(batch).where(eq(drugBatches.id, id)).returning();
    return updatedBatch;
  }

  async deleteDrugBatch(id: number): Promise<void> {
    await db.delete(drugBatches).where(eq(drugBatches.id, id));
  }

  async getLowStockBatches(threshold: number): Promise<DrugBatch[]> {
    return await db.select().from(drugBatches).where(lte(drugBatches.quantity, threshold));
  }

  async getExpiringBatches(days: number): Promise<DrugBatch[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    return await db.select().from(drugBatches).where(lte(drugBatches.expiryDate, futureDate));
  }

  // Sale operations
  async getSales(): Promise<Sale[]> {
    return await db.select().from(sales).orderBy(desc(sales.createdAt));
  }

  async getSale(id: number): Promise<Sale | undefined> {
    const [sale] = await db.select().from(sales).where(eq(sales.id, id));
    return sale;
  }

  async createSale(sale: InsertSale): Promise<Sale> {
    const [newSale] = await db.insert(sales).values(sale).returning();
    return newSale;
  }

  async getSaleItems(saleId: number): Promise<SaleItem[]> {
    return await db.select().from(saleItems).where(eq(saleItems.saleId, saleId));
  }

  async createSaleItem(saleItem: InsertSaleItem): Promise<SaleItem> {
    const [newSaleItem] = await db.insert(saleItems).values(saleItem).returning();
    return newSaleItem;
  }

  async getTodaysSales(): Promise<Sale[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return await db.select().from(sales).where(
      and(
        gte(sales.createdAt, today),
        lte(sales.createdAt, tomorrow)
      )
    );
  }

  async getSalesByDateRange(startDate: Date, endDate: Date): Promise<Sale[]> {
    return await db.select().from(sales).where(
      and(
        gte(sales.createdAt, startDate),
        lte(sales.createdAt, endDate)
      )
    );
  }

  // Purchase operations
  async getPurchases(): Promise<Purchase[]> {
    return await db.select().from(purchases).orderBy(desc(purchases.orderDate));
  }

  async getPurchase(id: number): Promise<Purchase | undefined> {
    const [purchase] = await db.select().from(purchases).where(eq(purchases.id, id));
    return purchase;
  }

  async createPurchase(purchase: InsertPurchase): Promise<Purchase> {
    const [newPurchase] = await db.insert(purchases).values(purchase).returning();
    return newPurchase;
  }

  async updatePurchase(id: number, purchase: Partial<InsertPurchase>): Promise<Purchase> {
    const [updatedPurchase] = await db.update(purchases).set(purchase).where(eq(purchases.id, id)).returning();
    return updatedPurchase;
  }

  async getPurchaseItems(purchaseId: number): Promise<PurchaseItem[]> {
    return await db.select().from(purchaseItems).where(eq(purchaseItems.purchaseId, purchaseId));
  }

  async createPurchaseItem(purchaseItem: InsertPurchaseItem): Promise<PurchaseItem> {
    const [newPurchaseItem] = await db.insert(purchaseItems).values(purchaseItem).returning();
    return newPurchaseItem;
  }

  // Settings operations
  async getSettings(): Promise<Setting[]> {
    return await db.select().from(settings);
  }

  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting;
  }

  async setSetting(key: string, value: string): Promise<Setting> {
    const [setting] = await db.insert(settings).values({ key, value })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value, updatedAt: new Date() }
      }).returning();
    return setting;
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    todaysSales: number;
    totalItems: number;
    lowStockCount: number;
    expiringCount: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const [todaysSalesResult] = await db.select({
      total: sql<number>`COALESCE(SUM(${sales.totalAmount}), 0)`
    }).from(sales).where(
      and(
        gte(sales.createdAt, today),
        lte(sales.createdAt, tomorrow)
      )
    );

    const [totalItemsResult] = await db.select({
      total: sql<number>`COALESCE(SUM(${drugBatches.quantity}), 0)`
    }).from(drugBatches);

    const [lowStockResult] = await db.select({
      count: sql<number>`COUNT(*)`
    }).from(drugBatches).where(lte(drugBatches.quantity, 10));

    const [expiringResult] = await db.select({
      count: sql<number>`COUNT(*)`
    }).from(drugBatches).where(lte(drugBatches.expiryDate, thirtyDaysFromNow));

    return {
      todaysSales: Number(todaysSalesResult.total),
      totalItems: Number(totalItemsResult.total),
      lowStockCount: Number(lowStockResult.count),
      expiringCount: Number(expiringResult.count)
    };
  }
}

export const storage = new DatabaseStorage();
