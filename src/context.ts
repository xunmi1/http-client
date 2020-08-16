import { RequestOptions } from './interfaces';

// Since the properties of `Request` are read-only, use `RequestOptions`
interface ContextRequest extends RequestOptions {
  url: string;
  params: URLSearchParams;
  headers: Headers;
}

interface ContextResponse extends Response {
  data?: any;
}

class Context {
  public readonly request: ContextRequest;
  public response?: ContextResponse;

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

  get headers() {
    return this.response?.headers;
  }
}

export default Context;
