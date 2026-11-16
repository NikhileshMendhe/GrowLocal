import { asyncHandler } from '../../utils/asyncHandler.js';
import { parsePagination } from '../../utils/pagination.js';
import * as adminService from './admin.service.js';

export const dashboard = asyncHandler(async (_req, res) => {
  res.json(await adminService.getDashboard());
});

export const listAuditLogs = asyncHandler(async (req, res) => {
  const { limit, offset } = parsePagination(req.query);
  const { rows, total } = await adminService.listAuditLogs({ limit, offset });
  res.json({ auditLogs: rows, total, limit, offset });
});

export const listActivities = asyncHandler(async (req, res) => {
  const { limit, offset } = parsePagination(req.query);
  const { rows, total } = await adminService.listActivities({ ...req.query, limit, offset });
  res.json({ activities: rows, total, limit, offset });
});

export const listShops = asyncHandler(async (req, res) => {
  const { limit, offset } = parsePagination(req.query);
  const { rows, total } = await adminService.listShops({ ...req.query, limit, offset });
  res.json({ shops: rows, total, limit, offset });
});

export const listMerchants = asyncHandler(async (req, res) => {
  const { limit, offset } = parsePagination(req.query);
  const { rows, total } = await adminService.listMerchants({ ...req.query, limit, offset });
  res.json({ merchants: rows, total, limit, offset });
});

export const listCustomers = asyncHandler(async (req, res) => {
  const { limit, offset } = parsePagination(req.query);
  const { rows, total } = await adminService.listCustomers({ ...req.query, limit, offset });
  res.json({ customers: rows, total, limit, offset });
});

export const listProducts = asyncHandler(async (req, res) => {
  const { limit, offset } = parsePagination(req.query);
  const { rows, total } = await adminService.listProducts({ ...req.query, limit, offset });
  res.json({ products: rows, total, limit, offset });
});

export const listOrders = asyncHandler(async (req, res) => {
  const { limit, offset } = parsePagination(req.query);
  const { rows, total } = await adminService.listOrders({ ...req.query, limit, offset });
  res.json({ orders: rows, total, limit, offset });
});

export const listEnquiries = asyncHandler(async (req, res) => {
  const { limit, offset } = parsePagination(req.query);
  const { rows, total } = await adminService.listEnquiries({ ...req.query, limit, offset });
  res.json({ enquiries: rows, total, limit, offset });
});

export const listVerifications = asyncHandler(async (req, res) => {
  const { limit, offset } = parsePagination(req.query);
  const { rows, total } = await adminService.listVerifications({ ...req.query, limit, offset });
  res.json({ verifications: rows, total, limit, offset });
});

export const setShopStatus = asyncHandler(async (req, res) => {
  const shop = await adminService.setShopStatus({
    shopId: req.params.id,
    status: req.body.status,
    adminId: req.auth.id,
    ipAddress: req.ip,
  });
  res.json({ shop });
});

export const setMerchantStatus = asyncHandler(async (req, res) => {
  const merchant = await adminService.setMerchantStatus({
    merchantId: req.params.id,
    status: req.body.status,
    adminId: req.auth.id,
    ipAddress: req.ip,
  });
  res.json({ merchant });
});

export const setCustomerStatus = asyncHandler(async (req, res) => {
  const customer = await adminService.setCustomerStatus({
    customerId: req.params.id,
    status: req.body.status,
    adminId: req.auth.id,
    ipAddress: req.ip,
  });
  res.json({ customer });
});

export const setProductApproval = asyncHandler(async (req, res) => {
  const product = await adminService.setProductApproval({
    productId: req.params.id,
    approvalStatus: req.body.approvalStatus,
    adminId: req.auth.id,
    ipAddress: req.ip,
  });
  res.json({ product });
});

export const reviewVerification = asyncHandler(async (req, res) => {
  const verification = await adminService.reviewVerification({
    verificationId: req.params.id,
    status: req.body.status,
    verificationNotes: req.body.verificationNotes,
    adminId: req.auth.id,
    ipAddress: req.ip,
  });
  res.json({ verification });
});

export const setEnquiryStatus = asyncHandler(async (req, res) => {
  const enquiry = await adminService.setEnquiryStatus({
    enquiryId: req.params.id,
    status: req.body.status,
  });
  res.json({ enquiry });
});

export const setOrderStatus = asyncHandler(async (req, res) => {
  const order = await adminService.setOrderStatus({
    orderId: req.params.id,
    status: req.body.status,
    adminId: req.auth.id,
    notes: req.body.notes,
  });
  res.json({ order });
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await adminService.getOrder(req.params.id);
  res.json({ order });
});

export const updateDelivery = asyncHandler(async (req, res) => {
  const delivery = await adminService.updateDelivery({
    orderId: req.params.id,
    ...req.body,
    adminId: req.auth.id,
  });
  res.json({ delivery });
});
