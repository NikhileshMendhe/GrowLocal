/**
 * Wraps an async route handler so rejections reach errorHandler.js (§7.1).
 * Express 4 does not catch rejected promises from handlers on its own.
 *
 * @param {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => Promise<any>} fn
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
