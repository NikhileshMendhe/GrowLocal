import * as repository from './conversations.repository.js';
import { emitToRooms } from '../../realtime/socket.js';
import { EVENTS } from '../../realtime/events.js';
import { conversationRoom } from '../../realtime/rooms.js';
import { assertOwnsConversation } from '../../middleware/ownership.js';
import { NotFoundError, ValidationError } from '../../errors/AppError.js';

// §6.7 — customer <-> merchant threads. MESSAGE_CREATED is emitted to the
// conversation room only AFTER the DB transaction commits (§7.5).

export async function createConversation(auth, input) {
  const shop = await repository.findShopById(input.shopId);
  if (!shop) throw new NotFoundError('Shop not found');

  let customerId;
  if (auth.type === 'customer') {
    customerId = auth.id;
  } else {
    if (!input.customerId) {
      throw new ValidationError('customerId is required when a merchant starts a conversation');
    }
    if (shop.merchant_id !== auth.id) {
      throw new NotFoundError('Shop not found');
    }
    const customer = await repository.findCustomerById(input.customerId);
    if (!customer) throw new NotFoundError('Customer not found');
    customerId = input.customerId;
  }

  const { conversation, created } = await repository.getOrCreate({
    customerId,
    shopId: input.shopId,
  });
  const detail = await repository.findById(conversation.id);
  return { conversation: detail, created };
}

export async function listConversations(auth, { limit, offset }) {
  return repository.listForCaller({ callerType: auth.type, callerId: auth.id, limit, offset });
}

export async function getConversation(conversationId, auth) {
  const conversation = await repository.findById(conversationId);
  assertOwnsConversation(conversation, auth);
  return conversation;
}

export async function listMessages(conversationId, auth, { limit, offset }) {
  const conversation = await repository.findById(conversationId);
  assertOwnsConversation(conversation, auth);
  return repository.listMessages({ conversationId, limit, offset });
}

export async function postMessage(conversationId, auth, input) {
  const conversation = await repository.findById(conversationId);
  assertOwnsConversation(conversation, auth);

  const message = await repository.insertMessage({
    conversationId,
    senderType: auth.type,
    senderId: auth.id,
    messageType: input.messageType,
    messageText: input.messageText,
    attachmentUrl: input.attachmentUrl,
  });

  emitToRooms(conversationRoom(conversationId), EVENTS.MESSAGE_CREATED, message);
  return message;
}
