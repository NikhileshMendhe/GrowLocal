import * as repository from './notifications.repository.js';
import { emitToRooms } from '../../realtime/socket.js';
import { EVENTS } from '../../realtime/events.js';
import { customerRoom, merchantRoom, adminRoom } from '../../realtime/rooms.js';
import { ForbiddenError, NotFoundError } from '../../errors/AppError.js';

function roomFor(recipientType, recipientId) {
  if (recipientType === 'customer') return customerRoom(recipientId);
  if (recipientType === 'merchant') return merchantRoom(recipientId);
  return adminRoom(recipientId);
}

/**
 * Creates a notification row AND emits NOTIFICATION_CREATED to the
 * recipient's room in the same call. Other services (orders, offers, chat)
 * call this right after their write commits — never from a polling job (§7.5).
 */
export async function create(input) {
  const notification = await repository.insert(input);
  emitToRooms(roomFor(input.recipientType, input.recipientId), EVENTS.NOTIFICATION_CREATED, notification);
  return notification;
}

export async function listForRecipient(auth, options) {
  return repository.listForRecipient(
    { recipientType: auth.type, recipientId: auth.id },
    options
  );
}

export async function markRead(id, auth) {
  const notification = await repository.findById(id);
  if (!notification) throw new NotFoundError('Notification not found');
  if (notification.recipient_type !== auth.type || notification.recipient_id !== auth.id) {
    throw new ForbiddenError('This notification is not yours');
  }
  return repository.markRead(id);
}

export async function markAllRead(auth) {
  const count = await repository.markAllRead({
    recipientType: auth.type,
    recipientId: auth.id,
  });
  return { updated: count };
}
