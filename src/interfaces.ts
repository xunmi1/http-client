import type Context from './Context';

export type ResponseType = 'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData';

export interface RequestOptions extends RequestInit {
  baseURL?: string;
  responseType?: ResponseType
  data?: any;
  params?: ConstructorParameters<typeof URLSearchParams>[0];
  timeout?: number;
  onDownloadProgress?: (event: { total: number, loaded: number }) => void;
}

export type Next = () => Promise<void>;
export type Middleware<T> = (context: Context, next: Next) => Promise<T>;
