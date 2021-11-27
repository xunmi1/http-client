import { Next, Context } from '../interfaces';

export interface DefaultReturnValue<T> {
  data: T;
  status: Response['status'];
  statusText: Response['statusText'];
  headers: Headers;
}

export const returnMiddleware = (ctx: Context, next: Next): Promise<DefaultReturnValue<unknown>> => {
  return next().then(() => ({
    data: ctx.data!,
    status: ctx.status!,
    statusText: ctx.statusText!,
    headers: ctx.headers!,
  }));
};
