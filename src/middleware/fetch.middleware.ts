import { Middleware, ResponseType } from '../interfaces';
import { isObject } from '../utils';
import { HttpError } from '../error';

const setHeadersIfUnset = (headers: Headers, name: string, value: string) => {
  if (!headers.has(name)) headers.append(name, value);
}

const transformParams = (url: string, baseURL?: string, params?: URLSearchParams) => {
  const result = new URL(url, baseURL);
  const searchParams = result.searchParams;
  // Append and not overwrite
  params?.forEach((v, k) => searchParams.append(k, v));
  return result;
}

const transformDataAndHeaders = <T>(data: T, headers: Headers) => {
  if (isObject(data)) {
    // if `data` is `FormData`, `fetch` will automatically set the request header
    if (data instanceof FormData) return data;
    setHeadersIfUnset(headers, 'Content-Type', 'application/json;charset=UTF-8');
    return JSON.stringify(data);
  }
  return data;
}

const types = ['json', 'text', 'blob', 'arrayBuffer', 'formData'];
const parseResponse = (response: Response, responseType?: ResponseType) => {
  const type = (responseType && types.includes(responseType)) ? responseType : 'json';
  return response?.clone()[type]();
}

const fetchMiddleware: Middleware<void> = async (ctx, next) => {
  const { baseURL, url, params, data, headers, responseType, ...options } = ctx.request;
  const { href } = transformParams(url, baseURL, params);

  // default common headers
  setHeadersIfUnset(headers, 'Accept', 'application/json, text/plain, */*');

  if (data != null) {
    options.body = transformDataAndHeaders(data, headers);
  }

  const response = await fetch(href, options);
  ctx.response = response;
  ctx.response.data = await parseResponse(response, responseType);

  // ok: status in the range 200 ~ 299
  if (!response.ok) {
    throw new HttpError(`Request failed with status code ${response.status}`, response);
  }

  return next();
}

export default fetchMiddleware;
