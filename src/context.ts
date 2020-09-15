import { RequestOptions, ResponseType, ResponseData } from './interfaces';

export interface ContextOptions<T> extends RequestOptions {
  responseType?: T extends ResponseType ? T : never;
}

// Since some properties of `Request` are read-only, use `RequestOptions`
export interface ContextRequest<T> extends ContextOptions<T> {
  url: string;
  // `params` and `headers` are necessary to narrow the range of types
  params: URLSearchParams;
  headers: Headers;
}

export interface ContextResponse<T> extends Response {
  data?: ResponseData<T>;
}

export class Context<T = any> {
  public readonly request: ContextRequest<T>;
  public response?: ContextResponse<T>;

  constructor(url: string, options: ContextOptions<T>) {
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
