import { Next, Context } from '../interfaces';
import { Exception } from '../exception';

export const parseFetchMiddleware = <T>(ctx: Context<T>, next: Next) => {
  const type = ctx.request.responseType ?? 'json';

  return next().then(() => {
    const response = ctx.response;
    if (!response || response.bodyUsed) return response?.body;

    return response
      .clone()
      [type]()
      .catch(() => {
        const message = `The responseType of \`${type}\` is not supported`;
        throw new Exception(message, Exception.Names.PARSE_ERROR, ctx);
      });
  });
};
