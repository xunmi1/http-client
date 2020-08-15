import compose from './compose';
import Context from './Context';
import { RequestOptions } from './interfaces';
import { isFunction, mergeOptions } from './utils';

export type Next = () => Promise<any>;
export type Middleware<T> = (context: Context, next: Next) => Promise<T>;

class HttpClient {
  private readonly middlewareStack: Middleware<any>[];
  public readonly options: RequestOptions;

  constructor(options?: RequestOptions) {
    this.middlewareStack = [];
    // The default value of `credentials` of some browsers is not `same-origin`
    this.options = mergeOptions(options);
  }

  use<T>(middleware: Middleware<T>) {
    if (!isFunction(middleware)) throw new TypeError('middleware must be a function!');
    this.middlewareStack.push(middleware);
    return this;
  }

  requset(url: string, options: RequestOptions) {
    const merged = mergeOptions(this.options, options)
    const ctx = new Context({ url, ...merged });
    return compose(this.middlewareStack)(ctx);
  }
}

export default HttpClient;
