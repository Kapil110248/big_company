import { Router } from 'express';
import { 
  getDashboard, 
  getCustomers, 
  getRetailers, 
  createRetailer, 
  getWholesalers, 
  createWholesaler,
  getLoans, 
  getNFCCards,
  getCategories 
} from '../controllers/adminController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/dashboard', getDashboard);
router.get('/customers', getCustomers);
router.get('/retailers', getRetailers);
router.post('/retailers', createRetailer);
router.get('/wholesalers', getWholesalers);
router.post('/wholesalers', createWholesaler);
router.get('/loans', getLoans);
router.get('/nfc-cards', getNFCCards);
router.get('/categories', getCategories);

export default router;
