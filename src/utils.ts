import { RequestOptions } from './interfaces';

const toRawType = (val: unknown) => Object.prototype.toString.call(val).slice(8, -1);

const isPlainObject = (val: unknown): val is Record<any, any> => toRawType(val) === 'Object';
export const isPlainJSON = (val: unknown): val is Record<any, any> | any[] => isPlainObject(val) || isArray(val);

export const isNumber = (val: unknown): val is number => typeof val === 'number';
export const isFunction = (val: unknown): val is Function => typeof val === 'function';
export const isArray = Array.isArray;
export const isObject = (val: unknown): val is Record<any, any> => val !== null && typeof val === 'object';

export const setIfNull = (target: Headers | URLSearchParams, key: string, value: string) => {
  if (!target.has(key)) target.append(key, value);
};

export const mergeOptions = (val1: RequestOptions = {}, val2: RequestOptions = {}): RequestOptions => {
  const merged = { ...val1, ...val2 };
  merged.headers = mergeHeaders(val1.headers, val2.headers);
  merged.params = mergeParams(val1.params, val2.params);
  merged.method = merged.method?.toUpperCase();
  return merged;
};

type RequestHeaders = RequestOptions['headers'];
type RequestParams = RequestOptions['params'];

const mergeHeaders = (val1: RequestHeaders, val2: RequestHeaders) => {
  const source = new Headers(val1);
  const result = new Headers(val2);
  // For options, directly overwrite, and not append
  source.forEach((v, k) => setIfNull(result, k, v));
  return result;
};

const mergeParams = (val1: RequestParams, val2: RequestParams) => {
  const source = createSearchParams(val1);
  const result = createSearchParams(val2);
  source.forEach((v, k) => setIfNull(result, k, v));
  return result;
};

const createSearchParams = (val: RequestParams): URLSearchParams => {
  if (isPlainObject(val)) {
    const searchParams = new URLSearchParams();
    Object.keys(val).forEach(k => {
      walkParams(searchParams, k, val[k]);
    });
    return searchParams;
  } else {
    // val is any[][] | string | URLSearchParams
    return new URLSearchParams(val);
  }
};

const walkParams = (searchParams: URLSearchParams, key: string, val: any): void => {
  if (val === undefined) return;
  // { x: null } => 'x='
  if (val === null) return searchParams.append(key, '');
  // { x: [1, 2] } => 'x=1&x=2'
  if (isArray(val)) return val.forEach(v => walkParams(searchParams, key, v));
  // { x: { y: { z: 1 } } } => 'x[y][z]=1'
  if (isObject(val))
    return Object.keys(val).forEach(k => {
      walkParams(searchParams, `${key}[${k}]`, val[k]);
    });
  searchParams.append(key, val);
};

const ABORT_ERROR_NAME = 'AbortError';
export const isAborted = (val: unknown): val is DOMException =>
  val instanceof DOMException && val.name === ABORT_ERROR_NAME;

export const promisify = <T extends (...args: any[]) => any>(fn: T) => (
  ...args: Parameters<T>
): Promise<ReturnType<T>> => Promise.resolve().then(() => fn(...args));
