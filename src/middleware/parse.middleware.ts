import { Middleware } from '../interfaces';
import { HttpError } from '../error';

const types = ['json', 'text', 'blob', 'arrayBuffer', 'formData'];

const parseMiddleware: Middleware<void> = async (ctx, next) => {
  await next();
  const responseType = ctx.options.responseType;
  const type = (responseType && types.includes(responseType)) ? responseType : 'json';
  const response = ctx.response!.clone();
  ctx.response!.data = await response[type]();

  // ok: status in the range 200-299
  if (!response.ok) {
   throw new HttpError(`Request failed with status code ${response.status}`, response);
  }
}

export default parseMiddleware;
