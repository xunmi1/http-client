import { Next, Context, ResponseType, ResponseData } from '../interfaces';
import { Exception } from '../exception';
import { isFunction, parseJSON } from '../utils';

const parse = <T extends ResponseType>(ctx: Context, type: T): Promise<ResponseData<T>> => {
  const cloned = ctx.response!.clone();
  if (type === 'json') {
    return cloned.text().then(parseJSON);
  }
  return cloned[type]();
};

export const parseFetchMiddleware = (ctx: Context, next: Next) => {
  const type = ctx.request.responseType ?? 'json';
  if (!isFunction(Response.prototype[type])) {
    throw new TypeError(`The responseType of '${type}' is not supported`);
  }

  return next().then(() =>
    parse(ctx, type)
      .then(data => {
        ctx.response!.data = data;
      })
      .catch(error => {
        throw new Exception(error, Exception.PARSE_ERROR, ctx);
      })
      .finally(() => {
        if (ctx.response!.ok) return;
        const message = `Request failed with status code ${ctx.status}`;
        throw new Exception(message, Exception.HTTP_ERROR, ctx);
      })
  );
};
