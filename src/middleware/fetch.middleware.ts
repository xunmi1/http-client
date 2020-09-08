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
  const request = ctx.request;
  const { baseURL, url, params, data, headers } = request;
  const { href } = transformParams(url, baseURL, params);

  // default common headers
  setIfNull(headers, 'Accept', 'application/json, text/plain, */*');

  if (request.body == null && data != null) {
    if (isPlainJSON(data)) {
      setIfNull(headers, 'Content-Type', 'application/json;charset=UTF-8');
      request.body = JSON.stringify(data);
    } else {
      request.body = data;
    }
  }

  return fetch(href, request)
    .then(response => {
      ctx.response = response;
    })
    .finally(next);
};
