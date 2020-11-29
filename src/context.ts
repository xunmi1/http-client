import { RequestOptions, ResponseType, ResponseData } from './interfaces';
import { createSearchParams } from './utils';

// Extend `RequestOptions` since some properties of `Request` are read-only
export interface ContextRequest<T extends ResponseType = 'json'> extends RequestOptions {
  url: string;
  // `params` and `headers` are necessary to narrow the range of types
  params: URLSearchParams;
  headers: Headers;
  responseType: T;
}

export interface ContextResponse<T> extends Response {
  data?: ResponseData<T>;
}

export class Context<T extends ResponseType = 'json'> {
  public readonly request: ContextRequest<T>;
  public response?: ContextResponse<T>;

  constructor(url: string, options: RequestOptions = {}) {
    const params = createSearchParams(options.params);
    const headers = new Headers(options.headers);
    const responseType: any = options.responseType ?? 'json';
    this.request = { ...options, url, params, headers, responseType };
  }

  get url() {
    return this.request.url;
  }

  get method() {
    return this.request.method;
  }

  get status() {
    return this.response?.status;
  }

  get statusText() {
    return this.response?.statusText;
  }

  get headers() {
    return this.response?.headers;
  }

  get data() {
    return this.response?.data;
  }
}
