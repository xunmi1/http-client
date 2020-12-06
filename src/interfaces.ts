import type { Context } from './context';
import type { PlainValue, PlainObject } from './utils';

export type { Context };

type PickKeys<T, R> = {
  [P in keyof T]: T[P] extends R ? P : never;
}[keyof T];

type AsyncFunction = (...args: any[]) => Promise<unknown>;
type AsyncReturnType<T extends AsyncFunction> = ReturnType<T> extends Promise<infer R> ? R : any;

export type RequestParams = PlainObject | ConstructorParameters<typeof URLSearchParams>[0];
export type RequestData = PlainValue | BodyInit;

export type ResponseType = PickKeys<Body, AsyncFunction>;
export type ResponseData<T> = T extends ResponseType ? AsyncReturnType<Body[T]> : any;

export interface DownloadProgressEvent<T = Uint8Array> {
  (event: { total: number; loaded: number; done: boolean; value?: T }): void;
}

export interface HttpClientOptions extends RequestInit {
  baseURL?: string;
  responseType?: ResponseType;
  params?: RequestParams;
  timeout?: number;
  onDownloadProgress?: DownloadProgressEvent;
}

export interface RequestOptions extends HttpClientOptions {
  data?: RequestData;
  // Convenient for users to expand the configuration
  [key: string]: any;
}

export interface Next {
  (): Promise<any>;
}

export interface Middleware<C = Context> {
  (context: C, next: Next): Promise<any>;
}
