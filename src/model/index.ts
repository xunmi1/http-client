import compose from './compose';
import { isFunction } from '../utils';
import { Middleware } from '../interfaces';

export abstract class Model<C = any> {
  static readonly compose = compose;
  protected readonly middlewareStack: Middleware<C>[] = [];
  protected abstract readonly coreMiddleware: Middleware<C>;

  use(middleware: Middleware<C>) {
    if (!isFunction(middleware)) throw new TypeError('middleware must be a function!');
    this.middlewareStack.push(middleware);
    return this;
  }

  protected compose() {
    const stack = this.middlewareStack.concat(this.coreMiddleware);
    return Model.compose(stack);
  }
}
