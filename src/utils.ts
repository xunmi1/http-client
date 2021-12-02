import { RequestOptions, RequestParams } from './interfaces';

const objectToString = Object.prototype.toString;
export const toRawType = (val: unknown): string => objectToString.call(val).slice(8, -1);

export const isNumber = (val: unknown): val is number => typeof val === 'number';
export const isBigInt = (val: unknown): val is bigint => typeof val === 'bigint';
export const isFunction = (val: unknown): val is Function => typeof val === 'function';
export const isArray = Array.isArray;
export const isObject = (val: unknown): val is object => val !== null && typeof val === 'object';

export type PlainValue = string | number | boolean | bigint | null | undefined | PlainObject | PlainArray;
export type PlainArray = PlainValue[];
export type PlainObject = { [key: string]: PlainValue };

const isPlainObject = (val: unknown): val is Record<any, any> => toRawType(val) === 'Object';
export const isPlainValue = (val: unknown): val is PlainValue => !isObject(val) || isPlainObject(val) || isArray(val);

export const setIfUndef = (target: Headers | URLSearchParams, key: string, value: string) => {
  if (!target.has(key)) target.set(key, value);
};

export const mergeOptions = <T extends RequestOptions>(val1: T, val2: Partial<T> = {}): T => {
  const merged = { ...val1, ...val2 };
  merged.headers = mergeHeaders(val1.headers, val2.headers);
  merged.params = mergeParams(val1.params, val2.params);
  merged.method = merged.method?.toUpperCase();
  // ignore first `data` option
  merged.data = val2.data;
  return merged;
};

type RequestHeaders = RequestOptions['headers'];

const mergeHeaders = (val1: RequestHeaders, val2?: RequestHeaders): Headers => {
  const source = new Headers(val1);
  const result = new Headers(val2);
  // For options, directly overwrite, and not append
  source.forEach((v, k) => setIfUndef(result, k, v));
  return result;
};

const mergeParams = (val1: RequestParams, val2?: RequestParams): URLSearchParams => {
  const source = createSearchParams(val1);
  const result = createSearchParams(val2);
  source.forEach((v, k) => setIfUndef(result, k, v));
  return result;
};

export const createSearchParams = (val?: RequestParams): URLSearchParams => {
  if (isPlainObject(val)) {
    const searchParams = new URLSearchParams();
    Object.keys(val).forEach(k => flatParams(searchParams, k, val[k]));
    return searchParams;
  }
  // val is string[][] | string | URLSearchParams
  return new URLSearchParams(val);
};

const flatParams = (searchParams: URLSearchParams, key: string, val: any): void => {
  if (val === undefined) return;
  // { x: null } -> 'x='
  if (val === null) return searchParams.append(key, '');
  // { x: [1, 2] } -> 'x=1&x=2'
  if (isArray(val)) return val.forEach(v => flatParams(searchParams, key, v));
  // { x: { y: { z: 1 } } } -> 'x[y][z]=1'
  if (isObject(val)) {
    Object.keys(val).forEach(k => flatParams(searchParams, `${key}[${k}]`, val[k]));
    return;
  }
  searchParams.append(key, val);
};

export const asyncify =
  <T extends (...args: any[]) => any>(fn: T) =>
  (...args: Parameters<T>): Promise<ReturnType<T>> =>
    Promise.resolve().then(() => fn(...args));

export const parse = (text: string): PlainValue => {
  if (!text || text === '') return text;
  try {
    return text && JSON.parse(text);
  } catch {
    return text;
  }
};

// JSON.stringify: support `bigint` type
export const stringify = (val: PlainValue): string => JSON.stringify(val, (_, v) => (isBigInt(v) ? v.toString() : v));
