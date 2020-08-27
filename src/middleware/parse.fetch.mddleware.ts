import { Next, Context } from '../interfaces';
import { HttpError } from '../error';

const TYPES = ['json', 'text', 'blob', 'arrayBuffer', 'formData'];

export const parseFetchMiddleware = <T>(ctx: Context<T>, next: Next) => {
  const responseType = ctx.request.responseType;
  const type = responseType && TYPES.includes(responseType) ? responseType : 'json';
  return next()
    .then(() => ctx.response?.clone()[type]())
    .catch(err => {
      if (err instanceof Error) throw new HttpError(err.message, ctx.response!);
      return Promise.reject(err);
    });
};
