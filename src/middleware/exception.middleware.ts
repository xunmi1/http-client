import { Next, Context } from '../interfaces';
import { Exception } from '../exception';
import { isAborted } from '../utils';

export const exceptionMiddleware = <T>(ctx: Context<T>, next: Next) => {
  return next().catch(error => {
    if (error instanceof Exception) return Promise.reject(error);

    if (isAborted(error)) {
      throw new Exception(error, Exception.Types.ABORT_ERROR, ctx);
    }
    if (error instanceof TypeError) {
      throw new Exception(error, Exception.Types.TYPE_ERROR, ctx);
    }
    if (error instanceof Error) {
      throw new Exception(error, Exception.Types.UNKNOWN_ERROR, ctx);
    }

    return Promise.reject(error);
  });
};
