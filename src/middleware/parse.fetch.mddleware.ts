import { Next, Context, ResponseType } from '../interfaces';
import { Exception } from '../exception';
import { isFunction } from '../utils';

const parse = <T>(ctx: Context, type: ResponseType): Promise<T> => {
  const cloned = ctx.response!.clone();
  if (type === 'json') {
    // response data may be an empty string
    return cloned.text().then(data => {
      try {
        return data && JSON.parse(data);
      } catch (error) {
        throw new Exception(error, Exception.PARSE_ERROR, ctx);
      }
    });
  }
  return (cloned[type]() as unknown) as Promise<T>;
};

export const parseFetchMiddleware = <T>(ctx: Context<T>, next: Next) => {
  const type = ctx.request.responseType ?? 'json';
  if (!isFunction(Response.prototype[type])) {
    throw new TypeError(`The responseType of '${type}' is not supported`);
  }

  return next().then(
    (): Promise<void> => {
      const response = ctx.response!;

      if (!response.ok) {
        const message = `Request failed with status code ${ctx.status}.`;
        throw new Exception(message, Exception.HTTP_ERROR, ctx);
      }

      return parse<T>(ctx, type).then(data => {
        response.data = data;
      });
    }
  );
};
