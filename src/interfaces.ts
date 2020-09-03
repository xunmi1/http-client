export type { Exception, ExceptionTypes } from './exception';
export type { Context, ContextRequest, ContextResponse } from './context';
import type { Context } from './context';

export type PickKeys<T, R> = {
  [P in keyof T]: T[P] extends R ? P : never;
}[keyof T];

export type ResponseType = PickKeys<Body, () => Promise<any>>;

export interface DownloadProgressEvent<T = Uint8Array> {
  (event: { total: number; loaded: number; done: boolean; value?: T }): void;
}

export interface RequestOptions extends RequestInit {
  baseURL?: string;
  responseType?: ResponseType;
  data?: any;
  params?: ConstructorParameters<typeof URLSearchParams>[0];
  timeout?: number | false;
  onDownloadProgress?: DownloadProgressEvent;
}

export type Next = () => Promise<void>;
export type Middleware<T = any, R = any> = (context: Context<R>, next: Next) => Promise<T>;
