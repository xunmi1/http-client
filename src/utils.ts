import { RequestOptions, RequestParams } from './interfaces';

const hasOwnProperty = Object.prototype.hasOwnProperty;
export const hasOwn = (val: Record<any, any>, key: string | symbol): key is keyof typeof val =>
  hasOwnProperty.call(val, key);

const objectToString = Object.prototype.toString;
export const toRawType = (val: unknown): string => objectToString.call(val).slice(8, -1);

export const isNumber = (val: unknown): val is number => typeof val === 'number';
export const isFunction = (val: unknown): val is Function => typeof val === 'function';
export const isArray = Array.isArray;
export const isObject = (val: unknown): val is Record<any, any> => val !== null && typeof val === 'object';

type PlainValue = string | number | boolean | BigInt | null | undefined | PlainJSON;
export type PlainArray = PlainValue[];
export type PlainObject = { [key: string]: PlainValue };
export type PlainJSON = PlainObject | PlainArray;

const isPlainObject = (val: unknown): val is object => toRawType(val) === 'Object';
export const isPlainJSON = (val: unknown): val is PlainJSON => isPlainObject(val) || isArray(val);

export const setIfNull = (target: Headers | URLSearchParams, key: string, value: string) => {
  if (!target.has(key)) target.append(key, value);
};

export const mergeOptions = (val1: RequestOptions, val2: RequestOptions = {}): RequestOptions => {
  const merged = { ...val1, ...val2 };
  merged.headers = mergeHeaders(val1.headers, val2.headers);
  merged.params = mergeParams(val1.params, val2.params);
  merged.method = merged.method?.toUpperCase();
  if (val2.data != null) {
    merged.data = deepMerge(val1.data, val2.data);
  }
  return merged;
};

type RequestHeaders = RequestOptions['headers'];

const mergeHeaders = (val1: RequestHeaders, val2: RequestHeaders): Headers => {
  const source = new Headers(val1);
  const result = new Headers(val2);
  // For options, directly overwrite, and not append
  source.forEach((v, k) => setIfNull(result, k, v));
  return result;
};

const mergeParams = (val1: RequestParams, val2: RequestParams): URLSearchParams => {
  const source = createSearchParams(val1);
  const result = createSearchParams(val2);
  source.forEach((v, k) => setIfNull(result, k, v));
  return result;
};

export const createSearchParams = (val: RequestParams): URLSearchParams => {
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

export type Merge<T1, T2> = Omit<T1, Extract<keyof T1, keyof T2>> & T2;

export const deepMerge = <T1 = any, T2 = any>(target: T1, source: T2): Merge<T1, T2> => {
  if (toRawType(target) === toRawType(source) && isObject(source)) {
    Object.keys(target).forEach(key => {
      const value = target[key];
      source[key] = hasOwn(source, key) ? deepMerge(value, source[key]) : value;
    });
  }

  return source as Merge<T1, T2>;
};

export const asyncify = <T extends (...args: any[]) => any>(fn: T) => (
  ...args: Parameters<T>
): Promise<ReturnType<T>> => Promise.resolve().then(() => fn(...args));

export const parseJSON = (text: string): any => {
  if (text === '') return text;
  try {
    return text && JSON.parse(text);
  } catch {
    return text;
  }
};
