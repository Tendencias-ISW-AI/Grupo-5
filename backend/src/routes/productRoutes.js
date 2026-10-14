import { Router } from 'express';
import { editProduct, getAllProducts, registerProduct, removeProduct } from '../controllers/productController.js';

const router = Router();
router.get('/', getAllProducts);
router.post('/', registerProduct);
router.put('/:id', editProduct);
router.delete('/:id', removeProduct);
export default router;
