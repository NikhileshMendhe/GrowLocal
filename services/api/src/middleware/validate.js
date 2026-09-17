import { ValidationError } from '../errors/AppError.js';

/**
 * Wraps a zod schema into an Express middleware; 400s on failure (§4).
 * On success the parsed (coerced/stripped) value replaces req[source],
 * so controllers work with exactly the schema's shape.
 *
 * Usage: router.post('/', validate(customerSignupSchema), controller)
 */
export function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(new ValidationError('Request validation failed', result.error.flatten()));
    }
    req[source] = result.data;
    return next();
  };
}
