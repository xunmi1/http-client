import { Next, Context } from '../interfaces';
import { Exception } from '../exception';

export const exceptionMiddleware = <T>(ctx: Context<T>, next: Next) => {
  return next().catch(error => {
    if (error instanceof Exception) return Promise.reject(error);
    if (error instanceof Error) {
      throw new Exception(error, error.name, ctx);
    }

    return Promise.reject(error);
  });
};
