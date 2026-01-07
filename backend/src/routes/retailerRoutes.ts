import { Router } from 'express';
import { 
  getDashboardStats, 
  getInventory, 
  createProduct, 
  updateProduct,
  getOrders,
  getBranches,
  createBranch,
  getWallet
} from '../controllers/retailerController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/dashboard', getDashboardStats);
router.get('/inventory', getInventory);
router.post('/inventory', createProduct);
router.put('/inventory/:id', updateProduct);
router.get('/orders', getOrders);
router.get('/branches', getBranches);
router.post('/branches', createBranch);
router.get('/wallet', getWallet);

export default router;
