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
  data?: any;
  params?: ConstructorParameters<typeof URLSearchParams>[0];
  timeout?: number | false;
  onDownloadProgress?: DownloadProgressEvent;
}

export { Context };

export interface Next {
  (): Promise<any>;
}

export interface Middleware<C = Context> {
  (context: C, next: Next): Promise<any>;
}
