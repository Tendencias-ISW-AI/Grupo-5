import { createProduct, deleteProduct, getProducts, updateProduct, updateProductStatus } from '../services/productService.js';

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

export async function editProduct(request, response, next) {
  try {
    response.status(200).json(await updateProduct(request.params.id, request.body));
  } catch (error) {
    next(error);
  }
}

export async function removeProduct(request, response, next) {
  try {
    await deleteProduct(request.params.id);
    response.status(204).end();
  } catch (error) {
    next(error);
  }
}

export async function changeProductStatus(request, response, next) {
  try {
    response.status(200).json(await updateProductStatus(request.params.id, request.body));
  } catch (error) {
    next(error);
  }
}
