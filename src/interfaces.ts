import type Context from './Context';
export type { Context };

type PickPromiseKeys<T> = {
  [P in keyof T]: T[P] extends () => Promise<any> ? P : never;
}[keyof T];

export interface DownloadResult<T = Uint8Array> {
  total: number;
  loaded: number;
  done: boolean;
  value?: T;
}

export interface RequestOptions extends RequestInit {
  baseURL?: string;
  responseType?: PickPromiseKeys<Body>;
  data?: any;
  params?: ConstructorParameters<typeof URLSearchParams>[0];
  timeout?: number | false;
  onDownloadProgress?: (result: DownloadResult) => void;
}

export type Next = () => Promise<void>;
export type Middleware<T = any, R = any> = (context: Context<R>, next: Next) => Promise<T>;
