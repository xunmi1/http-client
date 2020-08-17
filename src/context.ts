import { RequestOptions } from './interfaces';

// Since the properties of `Request` are read-only, use `RequestOptions`
interface ContextRequest extends RequestOptions {
  url: string;
  params: URLSearchParams;
  headers: Headers;
}

interface ContextResponse<T> extends Response {
  data?: T;
}

class Context<T> {
  public readonly request: ContextRequest;
  public response?: ContextResponse<T>;
  [key: string]: any;

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

export default Context;
