import { Next, Context } from '../interfaces';
import { TimeoutError } from '../error';
import { isNumber } from '../utils';

const MAX_SAFE_TIMEOUT = 2 ** 31 - 1;
const isWithinRange = (val: number, floor: number, ceiling: number) => val >= floor && val <= ceiling;

/**
 * Implement `timeout` feature
 */
export const timeoutMiddleware = <T>(ctx: Context<T>, next: Next) => {
  const { timeout, signal } = ctx.request;
  if (!isNumber(timeout)) return next();
  if (!isWithinRange(timeout, 0, MAX_SAFE_TIMEOUT)) {
    throw new RangeError(`Timeout of ${timeout}ms not to be within range ${0} - ${MAX_SAFE_TIMEOUT}ms`);
  }

  const controller = new AbortController();
  if (signal instanceof AbortSignal && !signal.aborted) {
    const abort = () => {
      controller.abort();
      signal.removeEventListener('abort', abort);
    };
    signal.addEventListener('abort', abort);
  }
  ctx.request.signal = controller.signal;

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new TimeoutError(`Timeout of ${timeout}ms exceeded`, ctx));
      controller.abort();
    }, timeout);

    next()
      .then(resolve)
      .catch(reject)
      .finally(() => {
        clearTimeout(timer);
      });
  });
};
