import type Context from './Context';
export type { Context };

export type DownloadResult = {
  total: number;
  loaded: number;
  done: boolean;
  value?: Uint8Array;
};

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
