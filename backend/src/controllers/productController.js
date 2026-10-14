import { createProduct, getProducts } from '../services/productService.js';

export async function getAllProducts(_request, response, next) {
  try {
    response.status(200).json(await getProducts());
  } catch (error) {
    next(error);
  }
}

export async function registerProduct(request, response, next) {
  try {
    response.status(201).json(await createProduct(request.body));
  } catch (error) {
    next(error);
  }
}
