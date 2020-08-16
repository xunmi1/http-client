import { RequestOptions } from './interfaces';

export const isObject = (val: unknown): val is Record<any, any> => val !== null && typeof val === 'object';
export const isNumber = (val: unknown): val is number => typeof val === 'number';
export const isString = (val: unknown): val is string => typeof val === 'string';
export const isFunction = (val: unknown): val is Function => typeof val === 'function';

export const mergeOptions = (global: RequestOptions = {}, options: RequestOptions = {}) => {
  const merged = { ...global, ...options };
  merged.headers = mergeHeaders(global.headers, options.headers);
  merged.params = mergeParams(global.params, options.params);

  // set default options
  merged.method = merged.method?.toUpperCase() ?? 'GET';
  merged.responseType = merged.responseType ?? 'json';
  // The default value of `credentials` of some browsers is not `same-origin`
  // e.g. Firefox 39-60 Chrome 42-67 Safari 10.1-11.1.2
  merged.credentials = merged.credentials ?? 'same-origin';
  return merged;
}

const mergeHeaders = (val1: RequestOptions['headers'] = {}, val2: RequestOptions['headers'] = {}) => {
  const source = new Headers(val1);
  const result = new Headers(val2);
  // For options, directly overwrite, and not append
  source.forEach((v, k) => result.set(k, v));
  return result;
};

const mergeParams = (val1: RequestOptions['params'], val2: RequestOptions['params']) => {
  const source = new URLSearchParams(val1);
  const result = new URLSearchParams(val2);
  source.forEach((v, k) => result.set(k, v));
  return result;
};
