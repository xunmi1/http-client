import type Context from './Context';
export type { Context };

export interface DownloadResult<T = Uint8Array> {
  total: number;
  loaded: number;
  done: boolean;
  value?: T;
}

export interface RequestOptions extends RequestInit {
  baseURL?: string;
  responseType?: 'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData';
  data?: any;
  params?: ConstructorParameters<typeof URLSearchParams>[0];
  timeout?: number;
  onDownloadProgress?: (result: DownloadResult) => void;
}

export type Next = () => Promise<void>;
export type Middleware<T = any> = (context: Context<any>, next: Next) => Promise<T>;
