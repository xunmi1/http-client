import { Next, Context } from '../interfaces';
import { Exception } from '../exception';
import { isAborted, isNetworkError } from '../utils';

export const exceptionMiddleware = <T>(ctx: Context<T>, next: Next) => {
  return next().catch(error => {
    if (error instanceof Exception) return Promise.reject(error);

    if (isAborted(error)) {
      throw new Exception(error, Exception.ABORT_ERROR, ctx);
    }
    if (isNetworkError(error)) {
      throw new Exception(error, Exception.NETWORK_ERROR, ctx);
    }

    return Promise.reject(error);
  });
};
