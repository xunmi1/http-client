import { Next, Context } from '../interfaces';
import { isPlainJSON, setIfNull } from '../utils';

const composeURL = (params: URLSearchParams, url: string, baseURL?: string) => {
  const hashIndex = url.indexOf('#');
  if (hashIndex > -1) url = url.slice(0, hashIndex);
  const serialized = params.toString();
  if (serialized !== '') url += (url.includes('?') ? '&' : '?') + serialized;
  return baseURL != null ? new URL(url, baseURL).href : url;
};

export const fetchMiddleware = <T>(ctx: Context<T>, next: Next) => {
  const request = ctx.request;
  const { baseURL, url, params, data, headers } = request;
  const requestURL = composeURL(params, url, baseURL);

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

  return fetch(requestURL, request)
    .then(response => {
      ctx.response = response;
    })
    .finally(next);
};
