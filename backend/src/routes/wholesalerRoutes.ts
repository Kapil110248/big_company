import { Router } from 'express';
import {
  getDashboardStats,
  getInventory,
  getInventoryStats,
  getCategories,
  createProduct,
  getRetailerOrders,
  updateOrderStatus,
  getCreditRequests
} from '../controllers/wholesalerController';
import {
  getRetailers,
  getRetailerStats,
  getSupplierOrders,
  getSuppliers,
  getCreditRequestsWithStats,
  approveCreditRequest,
  rejectCreditRequest
} from '../controllers/retailersController';
import {
  getManagementStats,
  getManagementSuppliers,
  getSupplierDetails,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getProfitInvoices,
  getProfitInvoiceDetails,
  updateInvoiceStatus
} from '../controllers/managementController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

// Dashboard
router.get('/dashboard', getDashboardStats);
router.get('/dashboard/stats', getDashboardStats);

// Inventory
router.get('/inventory', getInventory);
router.get('/inventory/stats', getInventoryStats);
router.get('/inventory/categories', getCategories);
router.post('/inventory', createProduct);

// Orders
router.get('/retailer-orders', getRetailerOrders);
router.get('/retailer-orders/stats', getRetailerOrders);
router.put('/retailer-orders/:id/status', updateOrderStatus);

// Retailers
router.get('/retailers', getRetailers);
router.get('/retailers/stats', getRetailerStats);

// Suppliers
router.get('/supplier-orders', getSupplierOrders);
router.get('/suppliers', getSuppliers);

// Management - Suppliers & Profit Invoices
router.get('/management/stats', getManagementStats);
router.get('/management/suppliers', getManagementSuppliers);
router.get('/management/suppliers/:id', getSupplierDetails);
router.post('/management/suppliers', createSupplier);
router.put('/management/suppliers/:id', updateSupplier);
router.delete('/management/suppliers/:id', deleteSupplier);
router.get('/management/profit-invoices', getProfitInvoices);
router.get('/management/profit-invoices/:id', getProfitInvoiceDetails);
router.put('/management/profit-invoices/:id/status', updateInvoiceStatus);

// Credit Management
router.get('/credit-requests', getCreditRequestsWithStats);
router.post('/credit-requests/:id/approve', approveCreditRequest);
router.post('/credit-requests/:id/reject', rejectCreditRequest);

export default router;
