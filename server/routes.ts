import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertCategorySchema, insertSupplierSchema, insertCustomerSchema,
  insertDrugSchema, insertDrugBatchSchema, insertSaleSchema, insertSaleItemSchema,
  insertPurchaseSchema, insertPurchaseItemSchema
} from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";

// Extend Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        role: string;
      };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Authentication middleware
function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Role-based access control
function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ 
        token, 
        user: { 
          id: user.id, 
          username: user.username, 
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        } 
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ message: 'Username already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });

      res.status(201).json({ 
        message: 'User created successfully', 
        user: { 
          id: user.id, 
          username: user.username, 
          role: user.role 
        } 
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Change password endpoint
  app.put('/api/auth/change-password', authenticateToken, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current password and new password are required' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters long' });
      }

      // Get current user
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password
      await storage.updateUser(user.id, { password: hashedNewPassword });

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Password change error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/dashboard/recent-sales', authenticateToken, async (req, res) => {
    try {
      const sales = await storage.getTodaysSales();
      res.json(sales.slice(0, 10)); // Get last 10 sales
    } catch (error) {
      console.error('Recent sales error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/dashboard/alerts', authenticateToken, async (req, res) => {
    try {
      const lowStock = await storage.getLowStockBatches(10);
      const expiring = await storage.getExpiringBatches(30);
      
      res.json({
        lowStock: lowStock.slice(0, 5),
        expiring: expiring.slice(0, 5)
      });
    } catch (error) {
      console.error('Dashboard alerts error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Category routes
  app.get('/api/categories', authenticateToken, async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/categories', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      console.error('Create category error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.put('/api/categories/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const categoryData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(id, categoryData);
      res.json(category);
    } catch (error) {
      console.error('Update category error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.delete('/api/categories/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCategory(id);
      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      console.error('Delete category error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Supplier routes
  app.get('/api/suppliers', authenticateToken, async (req, res) => {
    try {
      const suppliers = await storage.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      console.error('Get suppliers error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/suppliers', authenticateToken, requireRole(['admin', 'pharmacist']), async (req, res) => {
    try {
      const supplierData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(supplierData);
      res.status(201).json(supplier);
    } catch (error) {
      console.error('Create supplier error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Customer routes
  app.get('/api/customers', authenticateToken, async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      console.error('Get customers error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/customers', authenticateToken, async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      console.error('Create customer error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Drug routes
  app.get('/api/drugs', authenticateToken, async (req, res) => {
    try {
      const drugs = await storage.getDrugs();
      res.json(drugs);
    } catch (error) {
      console.error('Get drugs error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/drugs/search', authenticateToken, async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: 'Query parameter is required' });
      }
      
      const drugs = await storage.searchDrugs(query);
      res.json(drugs);
    } catch (error) {
      console.error('Search drugs error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/drugs', authenticateToken, requireRole(['admin', 'pharmacist']), async (req, res) => {
    try {
      const drugData = insertDrugSchema.parse(req.body);
      const drug = await storage.createDrug(drugData);
      res.status(201).json(drug);
    } catch (error) {
      console.error('Create drug error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.put('/api/drugs/:id', authenticateToken, requireRole(['admin', 'pharmacist']), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const drugData = insertDrugSchema.partial().parse(req.body);
      const drug = await storage.updateDrug(id, drugData);
      res.json(drug);
    } catch (error) {
      console.error('Update drug error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.delete('/api/drugs/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteDrug(id);
      res.status(204).send();
    } catch (error) {
      console.error('Delete drug error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Drug batch routes
  app.get('/api/drug-batches', authenticateToken, async (req, res) => {
    try {
      const batches = await storage.getDrugBatches();
      res.json(batches);
    } catch (error) {
      console.error('Get drug batches error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/drug-batches', authenticateToken, requireRole(['admin', 'pharmacist']), async (req, res) => {
    try {
      const batchData = insertDrugBatchSchema.parse(req.body);
      const batch = await storage.createDrugBatch(batchData);
      res.status(201).json(batch);
    } catch (error) {
      console.error('Create drug batch error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Sale routes
  app.get('/api/sales', authenticateToken, async (req, res) => {
    try {
      const sales = await storage.getSales();
      res.json(sales);
    } catch (error) {
      console.error('Get sales error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/sales', authenticateToken, async (req, res) => {
    try {
      const { 
        items, 
        subtotal, 
        taxAmount, 
        totalAmount, 
        paymentMethod, 
        amountReceived, 
        customerName, 
        customerPhone 
      } = req.body;
      
      // Generate receipt number
      const receiptNumber = `POS-${new Date().getFullYear()}-${Date.now()}`;
      
      const saleData = insertSaleSchema.parse({
        receiptNumber,
        subtotal,
        taxAmount,
        discountAmount: 0,
        totalAmount,
        paymentMethod,
        status: 'completed',
        userId: req.user!.id,
        customerName,
        customerPhone
      });
      
      const newSale = await storage.createSale(saleData);
      
      // Create sale items and update inventory
      const saleItems = [];
      for (const item of items) {
        const saleItemData = insertSaleItemSchema.parse({
          saleId: newSale.id,
          drugBatchId: item.drugBatchId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice
        });
        
        const createdItem = await storage.createSaleItem(saleItemData);
        saleItems.push(createdItem);
        
        // Update drug batch quantity
        const batch = await storage.getDrugBatch(item.drugBatchId);
        if (batch) {
          await storage.updateDrugBatch(item.drugBatchId, {
            quantity: batch.quantity - item.quantity
          });
        }
      }
      
      // Return sale with items for receipt generation
      const saleWithItems = {
        ...newSale,
        items: saleItems,
        amountReceived: amountReceived || totalAmount,
        change: amountReceived ? amountReceived - totalAmount : 0
      };
      
      res.status(201).json(saleWithItems);
    } catch (error) {
      console.error('Create sale error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Purchase routes
  app.get('/api/purchases', authenticateToken, async (req, res) => {
    try {
      const purchases = await storage.getPurchases();
      res.json(purchases);
    } catch (error) {
      console.error('Get purchases error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/purchases', authenticateToken, requireRole(['admin', 'pharmacist']), async (req, res) => {
    try {
      const { purchase, items } = req.body;
      
      // Generate purchase number
      const purchaseNumber = `PUR-${new Date().getFullYear()}-${Date.now()}`;
      
      const purchaseData = insertPurchaseSchema.parse({
        ...purchase,
        purchaseNumber,
        userId: req.user!.id
      });
      
      const newPurchase = await storage.createPurchase(purchaseData);
      
      // Create purchase items
      for (const item of items) {
        const purchaseItemData = insertPurchaseItemSchema.parse({
          ...item,
          purchaseId: newPurchase.id
        });
        await storage.createPurchaseItem(purchaseItemData);
      }
      
      res.status(201).json(newPurchase);
    } catch (error) {
      console.error('Create purchase error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Settings routes
  app.get('/api/settings', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      console.error('Get settings error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Initialize test data
  app.post('/api/init-test-data', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
      // Create test categories
      const categories = [
        { name: 'Antibiotics', description: 'Antimicrobial drugs' },
        { name: 'Painkillers', description: 'Pain relief medications' },
        { name: 'Vitamins', description: 'Vitamin supplements' }
      ];

      for (const category of categories) {
        try {
          await storage.createCategory(category);
        } catch (error) {
          // Category might already exist
        }
      }

      // Create test suppliers
      const suppliers = [
        { name: 'MediCorp', contactPerson: 'John Smith', phone: '555-0101', email: 'john@medicorp.com' },
        { name: 'PharmaSupply', contactPerson: 'Jane Doe', phone: '555-0102', email: 'jane@pharmasupply.com' }
      ];

      for (const supplier of suppliers) {
        try {
          await storage.createSupplier(supplier);
        } catch (error) {
          // Supplier might already exist
        }
      }

      // Create test drugs
      const drugs = [
        { name: 'Amoxicillin', genericName: 'Amoxicillin', dosage: '500mg', form: 'Capsules', categoryId: 1 },
        { name: 'Paracetamol', genericName: 'Acetaminophen', dosage: '500mg', form: 'Tablets', categoryId: 2 },
        { name: 'Vitamin C', genericName: 'Ascorbic Acid', dosage: '1000mg', form: 'Tablets', categoryId: 3 },
        { name: 'Ibuprofen', genericName: 'Ibuprofen', dosage: '400mg', form: 'Tablets', categoryId: 2 }
      ];

      for (const drug of drugs) {
        try {
          await storage.createDrug(drug);
        } catch (error) {
          // Drug might already exist
        }
      }

      // Create test drug batches
      const batches = [
        { drugId: 1, batchNumber: 'AMX001', expiryDate: new Date('2025-12-31'), quantity: 100, costPrice: 8.50, sellingPrice: 12.00, supplierId: 1 },
        { drugId: 2, batchNumber: 'PAR001', expiryDate: new Date('2025-11-30'), quantity: 150, costPrice: 3.25, sellingPrice: 5.50, supplierId: 1 },
        { drugId: 3, batchNumber: 'VIT001', expiryDate: new Date('2026-01-31'), quantity: 75, costPrice: 15.00, sellingPrice: 22.50, supplierId: 2 },
        { drugId: 4, batchNumber: 'IBU001', expiryDate: new Date('2025-10-31'), quantity: 200, costPrice: 4.75, sellingPrice: 8.00, supplierId: 2 }
      ];

      for (const batch of batches) {
        try {
          await storage.createDrugBatch(batch);
        } catch (error) {
          // Batch might already exist
        }
      }

      res.json({ message: 'Test data initialized successfully' });
    } catch (error) {
      console.error('Init test data error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.put('/api/settings/:key', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
      const key = req.params.key;
      const { value } = req.body;
      
      const setting = await storage.setSetting(key, value);
      res.json(setting);
    } catch (error) {
      console.error('Update setting error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
