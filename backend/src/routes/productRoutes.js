import { Router } from 'express';
import { editProduct, getAllProducts, registerProduct } from '../controllers/productController.js';

const router = Router();
router.get('/', getAllProducts);
router.post('/', registerProduct);
router.put('/:id', editProduct);
export default router;
