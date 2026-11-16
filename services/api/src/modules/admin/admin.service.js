import * as repository from './admin.repository.js';
import * as ordersRepository from '../orders/orders.repository.js';
import { NotFoundError } from '../../errors/AppError.js';

function found(row, message) {
  if (!row) throw new NotFoundError(message);
  return row;
}

export async function getDashboard() {
  const counts = await repository.dashboardCounts();
  const recent = await repository.recentActivity(10).catch(() => []);
  return { counts, recentActivity: recent };
}

export async function listAuditLogs(options) {
  return repository.listAuditLogs(options);
}

export async function listActivities(options) {
  return repository.listActivities(options);
}

export async function listShops(options) {
  return repository.listShops(options);
}

export async function listMerchants(options) {
  return repository.listMerchants(options);
}

export async function listCustomers(options) {
  return repository.listCustomers(options);
}

export async function listProducts(options) {
  return repository.listProducts(options);
}

export async function listOrders(options) {
  return repository.listOrders(options);
}

export async function listEnquiries(options) {
  return repository.listEnquiries(options);
}

export async function listVerifications(options) {
  return repository.listVerifications(options);
}

export async function setShopStatus(input) {
  return found(await repository.setShopStatus(input), 'Shop not found');
}

export async function setMerchantStatus(input) {
  return found(await repository.setMerchantStatus(input), 'Merchant not found');
}

export async function setCustomerStatus(input) {
  return found(await repository.setCustomerStatus(input), 'Customer not found');
}

export async function setProductApproval(input) {
  return found(await repository.setProductApproval(input), 'Product not found');
}

export async function reviewVerification(input) {
  return found(await repository.reviewVerification(input), 'Shop verification not found');
}

export async function setEnquiryStatus(input) {
  return found(await repository.setEnquiryStatus(input), 'Enquiry not found');
}

export async function setOrderStatus(input) {
  return found(await repository.setOrderStatus(input), 'Order not found');
}

export async function getOrder(orderId) {
  const order = await ordersRepository.findById(orderId);
  return found(order, 'Order not found');
}

export async function updateDelivery(input) {
  return found(await repository.updateDelivery(input), 'Delivery record not found');
}
