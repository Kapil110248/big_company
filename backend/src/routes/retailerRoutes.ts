import { Router } from 'express';
import { 
  getDashboardStats, 
  getInventory, 
  createProduct, 
  updateProduct,
  getOrders,
  getBranches,
  createBranch,
  getWallet,
  getPOSProducts,
  scanBarcode,
  createSale,
  getDailySales,
  getWholesalerProducts,
  createOrder
} from '../controllers/retailerController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/dashboard', getDashboardStats);
router.get('/inventory', getInventory);
router.post('/inventory', createProduct);
router.put('/inventory/:id', updateProduct);
router.get('/orders', getOrders);
router.post('/orders', createOrder); // Add this line
router.get('/branches', getBranches);
router.post('/branches', createBranch);
router.get('/wallet', getWallet);

// POS Routes
router.get('/pos/products', getPOSProducts);
router.post('/pos/scan', scanBarcode);
router.post('/pos/sale', createSale);
router.get('/pos/daily-sales', getDailySales);

// Wholesaler Products (for Add Stock)
router.get('/wholesaler/products', getWholesalerProducts);

export default router;
