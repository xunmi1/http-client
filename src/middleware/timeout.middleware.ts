import { Next, Context } from '../interfaces';
import { Exception } from '../exception';
import { isNumber } from '../utils';

const MAX_SAFE_TIMEOUT = 2 ** 31 - 1;
const MiN_SAFE_TIMEOUT = 0;

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
export const timeoutMiddleware = (ctx: Context, next: Next) => {
  const timeout = ctx.request.timeout;
  if (timeout == null) return next();
  if (!isNumber(timeout)) {
    throw new TypeError(`The timeout option must be a number`);
  }

  if (!isWithinRange(timeout, MiN_SAFE_TIMEOUT, MAX_SAFE_TIMEOUT)) {
    const message = `The timeout of ${timeout}ms not to be within range ${MiN_SAFE_TIMEOUT} - ${MAX_SAFE_TIMEOUT}ms`;
    throw new RangeError(message);
  }

  const controller = new AbortController();
  replaceSignal(ctx, controller);

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Exception(`The timeout of ${timeout}ms exceeded.`, Exception.TIMEOUT_ERROR, ctx));
      controller.abort();
    }, timeout);

    next()
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timer));
  });
};
