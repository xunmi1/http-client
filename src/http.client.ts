import { version } from '../package.json';
import { Model } from './model';
import { Context } from './context';
import { Exception } from './exception';
import {
  fetchMiddleware,
  downloadMiddleware,
  parseFetchMiddleware,
  timeoutMiddleware,
  returnMiddleware,
  exceptionMiddleware,
  DefaultReturnValue,
} from './middleware';
import { HttpClientOptions, Middleware, RequestOptions, ResponseData } from './interfaces';
import { mergeOptions } from './utils';

interface Options<T extends RequestOptions['responseType']> extends RequestOptions {
  responseType: T;
}

type HttpResult<T> = Promise<DefaultReturnValue<ResponseData<T>>>;

export interface RequestMethod {
  (url: string, options?: RequestOptions): Promise<unknown>;
}

export interface DefaultRequestMethod {
  (url: string, options: Options<'blob'>): HttpResult<'blob'>;
  (url: string, options: Options<'arrayBuffer'>): HttpResult<'arrayBuffer'>;
  <T extends string = string>(url: string, options: Options<'text'>): HttpResult<'text'>;
  <T = unknown>(url: string, options: Options<'json'>): HttpResult<'json'>;
  <T = unknown>(url: string, options?: RequestOptions): Promise<DefaultReturnValue<T>>;
}

const coreMiddleware = Model.compose([
  exceptionMiddleware,
  returnMiddleware,
  parseFetchMiddleware,
  timeoutMiddleware,
  downloadMiddleware,
  fetchMiddleware,
]);

const methods = ['get', 'post', 'delete', 'put', 'patch', 'head', 'options'] as const;

const initOptions: HttpClientOptions = {
  method: 'GET',
  responseType: 'json',
  // The default value of `credentials` of some old browsers is not `same-origin`,
  // e.g. Firefox 39-60, Chrome 42-67, Safari 10.1-11.1.2
  credentials: 'same-origin',
};

export class HttpClient<R extends RequestMethod = DefaultRequestMethod> extends Model<Context> {
  static readonly version = version;
  static readonly Model = Model;
  static readonly Exception = Exception;
  static readonly Context = Context;
  static readonly mergeOptions = mergeOptions;

  protected readonly defaults: HttpClientOptions;
  protected readonly coreMiddleware: Middleware = coreMiddleware;

  get: R;
  post: R;
  delete: R;
  put: R;
  patch: R;
  head: R;
  options: R;
  request: R;

  constructor(options?: HttpClientOptions) {
    super();
    this.defaults = HttpClient.mergeOptions(initOptions, options);
    this.request = ((url, options) => {
      const merged = HttpClient.mergeOptions(this.defaults, options);
      const ctx = new HttpClient.Context(url, merged);
      return this.compose()(ctx);
    }) as R;

    methods.forEach(method => {
      this[method] = ((url, options) => this.request(url, { ...options, method })) as R;
    });
  }
}
