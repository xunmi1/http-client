import { Next, Context, ResponseData, ResponseType } from '../interfaces';
import { Exception } from '../exception';
import { isFunction, parse } from '../utils';

const parseResponse = <T extends ResponseType>(response: Response, type: T): Promise<ResponseData<T>> => {
  if (type === 'json') return response.text().then(parse);
  return response[type]();
};

export const parseFetchMiddleware = <T extends ResponseType>(ctx: Context<T>, next: Next) => {
  const type = ctx.request.responseType;
  if (type && !isFunction(Response.prototype[type])) {
    throw new TypeError(`The responseType of '${type}' is not supported`);
  }

  return next().then(() => {
    const response = ctx.response!;
    return parseResponse(response.clone(), type)
      .then(data => {
        response.data = data;
      })
      .catch(/* istanbul ignore next */ error => Promise.reject(new Exception(error, Exception.PARSE_ERROR, ctx)))
      .finally(() => {
        if (response.ok) return;
        const message = `Request failed with status code ${ctx.status}`;
        throw new Exception(message, Exception.HTTP_ERROR, ctx);
      });
  });
};
