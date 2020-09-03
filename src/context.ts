import { RequestOptions } from './interfaces';

// Since some properties of `Request` are read-only, use `RequestOptions`
export interface ContextRequest extends RequestOptions {
  url: string;
  params: URLSearchParams;
  headers: Headers;
}

export interface ContextResponse<T> extends Response {
  data?: T;
}

export class Context<T = any> {
  public readonly request: ContextRequest;
  public response?: ContextResponse<T>;

  constructor(url: string, options: RequestOptions) {
    const params = new URLSearchParams(options.params);
    const headers = new Headers(options.headers);
    this.request = { ...options, url, params, headers };
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
