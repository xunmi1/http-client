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
  type DefaultReturnValue,
} from './middleware';
import { HttpClientOptions, Middleware, RequestOptions, ResponseType, ResponseData } from './interfaces';
import { mergeOptions } from './utils';

type Options<T extends ResponseType> = Omit<RequestOptions, 'responseType'> & { responseType: T };

type HttpResult<T, Type> = Promise<DefaultReturnValue<T extends ResponseData<Type> ? T : unknown>>;

export interface RequestMethod {
  (url: string, options?: RequestOptions): Promise<unknown>;
}

export interface DefaultRequestMethod {
  <T = Blob>(url: string, options: Options<'blob'>): HttpResult<T, 'blob'>;
  <T = ArrayBuffer>(url: string, options: Options<'arrayBuffer'>): HttpResult<T, 'arrayBuffer'>;
  <T = FormData>(url: string, options: Options<'formData'>): HttpResult<T, 'formData'>;
  <T = string>(url: string, options: Options<'text'>): HttpResult<T, 'text'>;
  <T = unknown>(url: string, options?: RequestOptions): HttpResult<T, 'json'>;
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
