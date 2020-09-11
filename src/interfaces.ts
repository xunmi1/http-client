import type { Context } from './context';

type PickKeys<T, R> = {
  [P in keyof T]: T[P] extends R ? P : never;
}[keyof T];

export type ResponseType = PickKeys<Body, () => Promise<any>>;

export interface DownloadProgressEvent<T = Uint8Array> {
  (event: { total: number; loaded: number; done: boolean; value?: T }): void;
}

export interface RequestOptions extends RequestInit {
  baseURL?: string;
  responseType?: ResponseType;
  data?: Record<string | number, any> | any[] | BodyInit;
  params?: any[][] | Record<string, any> | string | URLSearchParams;
  timeout?: number | false;
  onDownloadProgress?: DownloadProgressEvent;
  // Convenient for users to expand the configuration
  [key: string]: any;
}

export { Context };

export interface Next {
  (): Promise<any>;
}

export interface Middleware<C = Context> {
  (context: C, next: Next): Promise<any>;
}
