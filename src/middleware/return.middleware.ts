import { Next, Context } from '../interfaces';

const returnMiddleware = <T>(ctx: Context<T>, next: Next) => {
  return next().then(() => ({
    data: ctx.data!,
    status: ctx.status!,
    statusText: ctx.statusText!,
    headers: ctx.headers!,
  }));
};

export default returnMiddleware;
