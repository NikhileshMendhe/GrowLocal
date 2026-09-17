import { Server } from 'socket.io';

import { verifyAccessToken } from '../utils/jwt.js';
import { pool } from '../db/pool.js';
import { corsOptions } from '../config/cors.js';
import { logger } from '../utils/logger.js';
import {
  CATALOG_ROOM,
  shopRoom,
  customerRoom,
  merchantRoom,
  adminRoom,
  conversationRoom,
} from './rooms.js';

/**
 * Socket.IO server attached to the same HTTP server as Express (§7.5).
 *
 * Handshake auth: clients pass `io(url, { auth: { token: accessToken } })`.
 * - No token → anonymous; joins ONLY the public 'catalog' room (a logged-out
 *   visitor still gets live catalog updates — that is the whole point of the
 *   bug fix).
 * - Valid token → additionally joins identity rooms (customer:/merchant:/admin:
 *   plus every shop:{id} the merchant owns).
 * - Invalid/expired token → connection rejected.
 */
let io = null;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: corsOptions.origin, credentials: true },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(); // anonymous — catalog only
    try {
      const payload = verifyAccessToken(token);
      socket.data.auth = { type: payload.type, id: payload.sub };
      return next();
    } catch {
      return next(new Error('unauthorized'));
    }
  });

  io.on('connection', async (socket) => {
    const auth = socket.data.auth;

    await socket.join(CATALOG_ROOM);

    if (auth?.type === 'customer') {
      await socket.join(customerRoom(auth.id));
    } else if (auth?.type === 'merchant') {
      await socket.join(merchantRoom(auth.id));
      try {
        const { rows } = await pool.query('SELECT id FROM shops WHERE merchant_id = $1', [auth.id]);
        for (const row of rows) await socket.join(shopRoom(row.id));
      } catch (error) {
        logger.error({ err: error }, 'socket: failed to join merchant shop rooms');
      }
    } else if (auth?.type === 'admin') {
      await socket.join(adminRoom(auth.id));
    }

    // Participants join a conversation room when they open that thread (§7.5).
    socket.on('conversation:join', async (conversationId, ack) => {
      try {
        if (!auth || typeof conversationId !== 'string' || !UUID_RE.test(conversationId)) {
          ack?.({ ok: false, error: 'forbidden' });
          return;
        }
        const { rows } = await pool.query(
          'SELECT customer_id, merchant_id FROM conversations WHERE id = $1',
          [conversationId]
        );
        const conversation = rows[0];
        const isParticipant =
          conversation &&
          ((auth.type === 'customer' && conversation.customer_id === auth.id) ||
            (auth.type === 'merchant' && conversation.merchant_id === auth.id) ||
            auth.type === 'admin');
        if (!isParticipant) {
          ack?.({ ok: false, error: 'forbidden' });
          return;
        }
        await socket.join(conversationRoom(conversationId));
        ack?.({ ok: true });
      } catch (error) {
        logger.error({ err: error }, 'socket: conversation:join failed');
        ack?.({ ok: false, error: 'server_error' });
      }
    });

    socket.on('conversation:leave', (conversationId) => {
      if (typeof conversationId === 'string') socket.leave(conversationRoom(conversationId));
    });

    socket.on('error', (error) => {
      logger.warn({ err: error, socketId: socket.id }, 'socket error');
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized — call initSocket(httpServer) in src/index.js first');
  }
  return io;
}

/**
 * Emit `event` to one or more rooms. Services call this INSIDE the same
 * function that performed the write, right after the transaction commits —
 * never from a polling job (§7.5 — this is the bug fix).
 *
 * Degrades to a no-op when no socket server exists (unit tests).
 */
export function emitToRooms(rooms, event, payload) {
  if (!io) return;
  const targets = Array.isArray(rooms) ? rooms : [rooms];
  let emitter = io;
  for (const room of targets) emitter = emitter.to(room);
  emitter.emit(event, payload);
}

/** Test helper — forget the current server so a new one can be created. */
export function resetSocket() {
  if (io) {
    io.close();
    io = null;
  }
}
