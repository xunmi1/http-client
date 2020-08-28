import { Next, Context } from '../interfaces';
import { Exception } from '../exception';
import { isNumber } from '../utils';

const MAX_SAFE_TIMEOUT = 2 ** 31 - 1;
const isWithinRange = (val: number, floor: number, ceiling: number) => val >= floor && val <= ceiling;

const replaceSignal = (ctx: Context, controller: AbortController) => {
  const signal = ctx.request.signal;
  if (signal instanceof AbortSignal && !signal.aborted) {
    const abort = () => {
      controller.abort();
      signal.removeEventListener('abort', abort);
    };
    signal.addEventListener('abort', abort);
  }

  ctx.request.signal = controller.signal;
};

/**
 * Implement `timeout` feature
 */
export const timeoutMiddleware = <T>(ctx: Context<T>, next: Next) => {
  const timeout = ctx.request.timeout;
  if (!isNumber(timeout)) return next();

  if (!isWithinRange(timeout, 0, MAX_SAFE_TIMEOUT)) {
    const message = `The timeout of ${timeout}ms not to be within range ${0} - ${MAX_SAFE_TIMEOUT}ms`;
    throw new Exception(message, Exception.Names.TIMEOUT_ERROR, ctx);
  }

  const controller = new AbortController();
  replaceSignal(ctx, controller);

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Exception(`The timeout of ${timeout}ms exceeded`, Exception.Names.TIMEOUT_ERROR, ctx));
      controller.abort();
    }, timeout);

    next()
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timer));
  });
};
