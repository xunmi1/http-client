import { Middleware } from '../interfaces';
import { Exception } from '../exception';

export const exceptionMiddleware: Middleware = (ctx, next) => {
  return next().catch(error => {
    if (error instanceof Exception) return Promise.reject(error);
    if (error instanceof Error) {
      throw new Exception(error, error.name, ctx);
    }
    /* istanbul ignore next */
    return Promise.reject(error);
  });
};
