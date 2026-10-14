import { Router } from 'express';
import { changeProductStatus, editProduct, getAllProducts, registerProduct, removeProduct } from '../controllers/productController.js';

const router = Router();
router.get('/', getAllProducts);
router.post('/', registerProduct);
router.put('/:id', editProduct);
router.delete('/:id', removeProduct);
router.patch('/:id/status', changeProductStatus);
export default router;
