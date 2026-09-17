import * as repository from './creators.repository.js';
import { NotFoundError } from '../../errors/AppError.js';

// §6.8: public read path — only approved creators are visible.
export async function listCreators(options) {
  return repository.list(options);
}

export async function getCreator(id) {
  const creator = await repository.findApprovedById(id);
  if (!creator) throw new NotFoundError('Creator not found');
  return creator;
}
