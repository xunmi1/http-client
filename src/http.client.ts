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
} from './middleware';
import { HttpClientOptions, RequestOptions } from './interfaces';
import { mergeOptions } from './utils';

export type RequestMethod = HttpClient['request'];

const coreMiddleware = Model.compose([
  exceptionMiddleware,
  returnMiddleware,
  parseFetchMiddleware,
  timeoutMiddleware,
  downloadMiddleware,
  fetchMiddleware,
]);

const initOptions: HttpClientOptions = {
  method: 'GET',
  responseType: 'json',
  // The default value of `credentials` of some old browsers is not `same-origin`,
  // e.g. Firefox 39-60, Chrome 42-67, Safari 10.1-11.1.2
  credentials: 'same-origin',
};

export class HttpClient extends Model<Context> {
  static readonly version = version;
  static readonly Model = Model;
  static readonly Exception = Exception;
  static readonly Context = Context;
  static readonly mergeOptions = mergeOptions;

  protected readonly defaults: HttpClientOptions;
  protected readonly coreMiddleware = coreMiddleware;

  get: RequestMethod;
  post: RequestMethod;
  delete: RequestMethod;
  put: RequestMethod;
  patch: RequestMethod;
  head: RequestMethod;
  options: RequestMethod;

  constructor(options?: HttpClientOptions) {
    super();
    this.defaults = HttpClient.mergeOptions(initOptions, options);

    const methods = ['get', 'post', 'delete', 'put', 'patch', 'head', 'options'];
    methods.forEach(method => {
      this[method] = (url: string, options?: RequestOptions) => this.request(url, { ...options, method });
    });
  }

  request(url: string, options?: RequestOptions): Promise<any> {
    const merged = HttpClient.mergeOptions(this.defaults, options);
    const ctx = new HttpClient.Context(url, merged);
    return this.compose()(ctx);
  }
}
