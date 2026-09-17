import * as repository from './categories.repository.js';
import { NotFoundError, ConflictError } from '../../errors/AppError.js';

export async function list(auth) {
  const includeInactive = auth?.type === 'admin';
  return repository.list({ includeInactive });
}

export async function getById(id) {
  const category = await repository.findById(id);
  if (!category) throw new NotFoundError('Category not found');
  return category;
}

export async function create(input) {
  const existing = await repository.findBySlug(input.slug);
  if (existing) throw new ConflictError('A category with this slug already exists');
  return repository.create(input);
}

export async function update(id, input) {
  if (input.slug) {
    const existing = await repository.findBySlug(input.slug);
    if (existing && existing.id !== id) {
      throw new ConflictError('A category with this slug already exists');
    }
  }
  const category = await repository.update(id, input);
  if (!category) throw new NotFoundError('Category not found');
  return category;
}

export async function remove(id) {
  const deleted = await repository.remove(id);
  if (!deleted) throw new NotFoundError('Category not found');
}
