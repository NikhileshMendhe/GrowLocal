import * as repository from './locations.repository.js';
import { NotFoundError } from '../../errors/AppError.js';

export async function list(auth) {
  return repository.list({ includeInactive: auth?.type === 'admin' });
}

export async function getById(id) {
  const location = await repository.findById(id);
  if (!location) throw new NotFoundError('Location not found');
  return location;
}

export async function create(input) {
  return repository.create(input);
}

export async function update(id, input) {
  const location = await repository.update(id, input);
  if (!location) throw new NotFoundError('Location not found');
  return location;
}

export async function remove(id) {
  const deleted = await repository.remove(id);
  if (!deleted) throw new NotFoundError('Location not found');
}
