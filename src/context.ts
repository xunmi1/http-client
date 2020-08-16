import { RequestOptions } from './interfaces';

type Overwrite<T, R> = Omit<T, keyof R> & R;

interface ContextParams extends RequestOptions {
  url: string;
}

interface OverwriteOptions {
  headers: Headers,
  params: URLSearchParams,
}
export type ContextOptions = Overwrite<ContextParams, OverwriteOptions>;

interface ContextResponse extends Response {
  data?: any;
}

class Context {
  public readonly options: ContextOptions;
  public response?: ContextResponse;

  constructor(options: ContextParams) {
    const headers = new Headers(options.headers);
    const params = new URLSearchParams(options.params);
    this.options = { ...options, headers, params };
  }

  get url() {
    return this.options.url;
  }

  get method() {
    return this.options.method;
  }

  get status() {
    return this.response?.status;
  }

  get headers() {
    return this.response?.headers;
  }
}

export default Context;
