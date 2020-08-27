import { Next, Context } from '../interfaces';
import { isPlainJSON } from '../utils';
import { HttpError } from '../error';

const methodsNoBody = ['GET', 'HEAD'];

const setHeaderIfUnset = (headers: Headers, name: string, value: string) => {
  if (!headers.has(name)) headers.append(name, value);
};

const transformParams = (url: string, baseURL?: string, params?: URLSearchParams) => {
  const result = new URL(url, baseURL);
  const searchParams = result.searchParams;
  // Append and not overwrite
  params?.forEach((v, k) => searchParams.append(k, v));
  return result;
};

export const fetchMiddleware = <T>(ctx: Context<T>, next: Next) => {
  const { baseURL, url, params, data, responseType, onDownloadProgress, timeout, ...options } = ctx.request;
  const { href } = transformParams(url, baseURL, params);

  // default common headers
  setHeaderIfUnset(options.headers, 'Accept', 'application/json, text/plain, */*');

  if (options.body == null && data != null && !methodsNoBody.includes(options.method ?? 'GET')) {
    if (isPlainJSON(data)) {
      setHeaderIfUnset(options.headers, 'Content-Type', 'application/json;charset=UTF-8');
      options.body = JSON.stringify(data);
    }
    options.body = data;
  }
  return fetch(href, options)
    .then(response => {
      ctx.response = response;
      if (!response.ok) {
        throw new HttpError(`Request failed with status code ${response.status}`, response);
      }
    })
    .finally(next);
};
