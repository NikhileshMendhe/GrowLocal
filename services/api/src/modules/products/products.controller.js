import { asyncHandler } from '../../utils/asyncHandler.js';
import { parsePagination } from '../../utils/pagination.js';
import * as productsService from './products.service.js';

export const list = asyncHandler(async (req, res) => {
  const { limit, offset } = parsePagination(req.query);
  const { rows, total } = await productsService.listProducts(req.auth, req.query, { limit, offset });
  res.json({ products: rows, total, limit, offset });
});

export const getById = asyncHandler(async (req, res) => {
  const product = await productsService.getProduct(req.auth, req.params.id);
  res.json({ product });
});

export const create = asyncHandler(async (req, res) => {
  const product = await productsService.createProduct(req.auth, req.body);
  res.status(201).json({ product });
});

export const update = asyncHandler(async (req, res) => {
  const product = await productsService.updateProduct(req.auth, req.params.id, req.body);
  res.json({ product });
});

export const updateStock = asyncHandler(async (req, res) => {
  const product = await productsService.updateStock(req.auth, req.params.id, req.body);
  res.json({ product });
});

export const remove = asyncHandler(async (req, res) => {
  await productsService.deleteProduct(req.auth, req.params.id);
  res.status(204).send();
});
