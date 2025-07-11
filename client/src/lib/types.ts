export interface CartItem {
  id: number;
  drugId: number;
  drugBatchId: number;
  name: string;
  dosage: string;
  batchNumber: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  stock: number;
}

export interface DashboardStats {
  todaysSales: number;
  totalItems: number;
  lowStockCount: number;
  expiringCount: number;
}

export interface AlertData {
  lowStock: Array<{
    id: number;
    drugId: number;
    batchNumber: string;
    quantity: number;
    drug?: {
      name: string;
      dosage: string;
    };
  }>;
  expiring: Array<{
    id: number;
    drugId: number;
    batchNumber: string;
    expiryDate: string;
    drug?: {
      name: string;
      dosage: string;
    };
  }>;
}

export interface DrugWithBatch {
  id: number;
  name: string;
  genericName?: string;
  brand?: string;
  dosage?: string;
  form?: string;
  barcode?: string;
  categoryId?: number;
  batches: Array<{
    id: number;
    batchNumber: string;
    expiryDate: string;
    quantity: number;
    costPrice: number;
    sellingPrice: number;
    supplierId?: number;
  }>;
}

export interface SaleWithItems {
  id: number;
  receiptNumber: string;
  customerId?: number;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  items: Array<{
    id: number;
    drugBatchId: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    drugBatch?: {
      batchNumber: string;
      drug?: {
        name: string;
        dosage: string;
      };
    };
  }>;
}

export interface PurchaseWithItems {
  id: number;
  purchaseNumber: string;
  supplierId: number;
  totalAmount: number;
  status: string;
  orderDate: string;
  receivedDate?: string;
  supplier?: {
    name: string;
    contactPerson?: string;
  };
  items: Array<{
    id: number;
    drugId: number;
    quantity: number;
    unitCost: number;
    totalCost: number;
    batchNumber: string;
    expiryDate: string;
    drug?: {
      name: string;
      dosage: string;
    };
  }>;
}

export interface AuthUser {
  id: number;
  username: string;
  email?: string;
  role: string;
  firstName?: string;
  lastName?: string;
  token: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email?: string;
    role: string;
    firstName?: string;
    lastName?: string;
  };
}
