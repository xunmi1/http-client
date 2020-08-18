import { version } from '../package.json';
import compose from './compose';
import Context from './Context';
import { fetchMiddleware, returnMiddleware } from './middleware';
import { RequestOptions, Middleware } from './interfaces';
import { isFunction, mergeOptions } from './utils';

class HttpClient {
  static readonly version = version;
  private readonly middlewareStack: Middleware<any>[];
  protected readonly coreMiddlewareStack: Middleware<any>[];
  public readonly options: RequestOptions;
  public data: any;

  constructor(options?: RequestOptions) {
    this.middlewareStack = [];
    this.options = mergeOptions(options);
    this.coreMiddlewareStack = [returnMiddleware, fetchMiddleware];
  }

  use<T>(middleware: Middleware<T>) {
    if (!isFunction(middleware)) throw new TypeError('middleware must be a function!');
    this.middlewareStack.push(middleware);
    return this;
  }

  request<T>(url: string, options?: RequestOptions) {
    const merged = mergeOptions(this.options, options);
    const ctx = new Context<T>(url, merged);
    const stack = [...this.middlewareStack, ...this.coreMiddlewareStack];
    return compose(stack)(ctx);
  }
}

export default HttpClient;
