import { Context, Middleware } from '../interfaces';
import { Exception } from '../exception';
import { isNumber } from '../utils';

const TIMEOUT_MAX_SAFE = 2 ** 31 - 1;
const TIMEOUT_MIN_SAFE = 0;

const isWithinRange = (val: number, floor: number, ceiling: number) => val >= floor && val <= ceiling;

const replaceSignal = (ctx: Context, controller: AbortController) => {
  const signal = ctx.request.signal;
  if (signal instanceof AbortSignal && !signal.aborted) {
    signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  ctx.request.signal = controller.signal;
};

/**
 * Implement `timeout` feature
 */
export const timeoutMiddleware: Middleware = (ctx, next) => {
  const timeout = ctx.request.timeout;
  if (timeout == null) return next();
  if (!isNumber(timeout)) {
    throw new TypeError(`The timeout option must be a number`);
  }

  if (!isWithinRange(timeout, TIMEOUT_MIN_SAFE, TIMEOUT_MAX_SAFE)) {
    const message = `The timeout of ${timeout}ms not to be within range ${TIMEOUT_MIN_SAFE} - ${TIMEOUT_MAX_SAFE}ms`;
    throw new RangeError(message);
  }

  const controller = new AbortController();
  replaceSignal(ctx, controller);

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      controller.abort();
      reject(new Exception(`The timeout of ${timeout}ms exceeded.`, Exception.TIMEOUT_ERROR, ctx));
    }, timeout);

    next()
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timer));
  });
};
