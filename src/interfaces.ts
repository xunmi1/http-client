export type ResponseType = 'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData';

export interface RequestOptions extends RequestInit {
  baseURL?: string;
  requestType?: 'json' | 'form';
  responseType?: ResponseType
  data?: any;
  params?: ConstructorParameters<typeof URLSearchParams>[0];
  timeout?: number;
  onDownloadProgress?: (event: { total: number, loaded: number }) => void;
}
