import { Next, Context, ResponseData } from '../interfaces';
import { Exception } from '../exception';
import { isFunction } from '../utils';

const parseJSON = (text: string): any => {
  try {
    return text && JSON.parse(text);
  } catch {
    return text;
  }
};
const parse = <T>(response: Response, type = 'json'): Promise<ResponseData<T>> => {
  if (type === 'json') return response.text().then(parseJSON);
  return response[type]();
};

export const parseFetchMiddleware = <T>(ctx: Context<T>, next: Next) => {
  const type = ctx.request.responseType;
  if (type && !isFunction(Response.prototype[type])) {
    throw new TypeError(`The responseType of '${type}' is not supported`);
  }

  return next().then(() => {
    const response = ctx.response!;
    return parse<T>(response.clone(), type)
      .then(data => {
        response.data = data;
      })
      .catch(error => {
        /* istanbul ignore next */
        throw new Exception(error, Exception.PARSE_ERROR, ctx);
      })
      .finally(() => {
        if (response.ok) return;
        const message = `Request failed with status code ${ctx.status}`;
        throw new Exception(message, Exception.HTTP_ERROR, ctx);
      });
  });
};
