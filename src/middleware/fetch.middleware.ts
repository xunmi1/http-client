import { Middleware } from '../interfaces';
import { isPlainValue, setIfUndef, stringify } from '../utils';

const composeURL = (params: URLSearchParams, url: string, baseURL?: string): string => {
  const hashIndex = url.indexOf('#');
  if (hashIndex > -1) url = url.slice(0, hashIndex);
  const serialized = params.toString();
  if (serialized !== '') url += (url.includes('?') ? '&' : '?') + serialized;
  return baseURL != null ? new URL(url, baseURL).href : url;
};

export const fetchMiddleware: Middleware = (ctx, next) => {
  const request = ctx.request;
  const { baseURL, url, params, data, headers } = request;
  const requestURL = composeURL(params, url, baseURL);

  // default common headers
  setIfUndef(headers, 'Accept', 'application/json, text/plain, */*');

  if (request.body == null && data != null) {
    if (isPlainValue(data)) {
      setIfUndef(headers, 'Content-Type', 'application/json;charset=UTF-8');
      request.body = stringify(data);
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
