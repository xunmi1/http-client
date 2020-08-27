import { Next, Context } from '../interfaces';

const TYPES = ['json', 'text', 'blob', 'arrayBuffer', 'formData'];

export const parseFetchMiddleware = <T>(ctx: Context<T>, next: Next) => {
  const type = ctx.request.responseType;
  const handler = type && TYPES.includes(type) ? type : 'json';
  return next().then(() => ctx.response?.clone()[handler]());
};
