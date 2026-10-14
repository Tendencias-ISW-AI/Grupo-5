import { Router } from 'express';
import { getAllProducts, registerProduct } from '../controllers/productController.js';

const router = Router();
router.get('/', getAllProducts);
router.post('/', registerProduct);
export default router;
