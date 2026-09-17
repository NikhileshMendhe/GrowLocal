import * as repository from './customers.repository.js';
import { NotFoundError } from '../../errors/AppError.js';

export async function getProfile(customerId) {
  const customer = await repository.findCustomerById(customerId);
  if (!customer) throw new NotFoundError('Customer not found');
  return customer;
}

export async function updateProfile(customerId, fields) {
  const customer = await repository.updateCustomer(customerId, fields);
  if (!customer) throw new NotFoundError('Customer not found');
  return customer;
}
