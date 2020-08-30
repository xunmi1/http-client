import { Next, Context } from '../interfaces';
import { isPlainJSON, setIfNull } from '../utils';

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
  setIfNull(options.headers, 'Accept', 'application/json, text/plain, */*');

  if (options.body == null && data != null) {
    if (isPlainJSON(data)) {
      setIfNull(options.headers, 'Content-Type', 'application/json;charset=UTF-8');
      options.body = JSON.stringify(data);
    }
    options.body = data;
  }

  return fetch(href, options)
    .then(response => {
      ctx.response = response;
    })
    .finally(next);
};
