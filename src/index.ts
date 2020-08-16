import compose from './compose';
import Context from './Context';
import { RequestOptions, Middleware } from './interfaces';
import { isFunction, mergeOptions } from './utils';

class HttpClient {
  private readonly middlewareStack: Middleware<unknown>[];
  public readonly options: RequestOptions;
  public data: any;

  constructor(options?: RequestOptions) {
    this.middlewareStack = [];
    this.options = mergeOptions(options);
  }

  use<T>(middleware: Middleware<T>) {
    if (!isFunction(middleware)) throw new TypeError('middleware must be a function!');
    this.middlewareStack.push(middleware);
    return this;
  }

  requset(url: string, options: RequestOptions) {
    const merged = mergeOptions(this.options, options)
    const ctx = new Context(url, merged);
    return compose(this.middlewareStack)(ctx);
  }
}

export default HttpClient;
