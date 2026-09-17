import { asyncHandler } from '../../utils/asyncHandler.js';
import { parsePagination } from '../../utils/pagination.js';
import * as conversationsService from './conversations.service.js';

export const createConversation = asyncHandler(async (req, res) => {
  const { conversation, created } = await conversationsService.createConversation(req.auth, req.body);
  if (created) return res.status(201).json({ conversation });
  return res.json({ conversation });
});

export const listConversations = asyncHandler(async (req, res) => {
  const { limit, offset } = parsePagination(req.query);
  const { rows, total } = await conversationsService.listConversations(req.auth, { limit, offset });
  res.json({ conversations: rows, total, limit, offset });
});

export const getConversation = asyncHandler(async (req, res) => {
  const conversation = await conversationsService.getConversation(req.params.id, req.auth);
  res.json({ conversation });
});

export const listMessages = asyncHandler(async (req, res) => {
  const { limit, offset } = parsePagination(req.query);
  const { rows, total } = await conversationsService.listMessages(req.params.id, req.auth, {
    limit,
    offset,
  });
  res.json({ messages: rows, total, limit, offset });
});

export const postMessage = asyncHandler(async (req, res) => {
  const message = await conversationsService.postMessage(req.params.id, req.auth, req.body);
  res.status(201).json({ message });
});
