import { getProducts } from '../services/productService.js';

export async function getAllProducts(_request, response, next) {
  try {
    response.status(200).json(await getProducts());
  } catch (error) {
    next(error);
  }
}
