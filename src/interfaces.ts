import type Context from './Context';
export type { Context };

export interface RequestOptions extends RequestInit {
  baseURL?: string;
  responseType?: 'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData';
  data?: any;
  params?: ConstructorParameters<typeof URLSearchParams>[0];
  timeout?: number;
  onDownloadProgress?: (event: { total: number; loaded: number }) => void;
}

export type Next = () => Promise<void>;
export type Middleware<T = any> = (context: Context<any>, next: Next) => Promise<T>;
