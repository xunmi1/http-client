import { Next, Context } from '../interfaces';
import { Exception } from '../exception';

export const parseFetchMiddleware = <T>(ctx: Context<T>, next: Next) => {
  const type = ctx.request.responseType ?? 'json';

  return next().then((): Promise<void> => {
    const response = ctx.response!;

    if (!response.ok) {
      const message = `Request failed with status code ${ctx.status}.`;
      throw new Exception(message, Exception.Types.HTTP_ERROR, ctx);
    }

    return response
      .clone()
      [type]()
      .then((data: T) => {
        response.data = data;
      })
      .catch(error => {
        throw new Exception(error, Exception.Types.PARSE_ERROR, ctx);
      });
  });
};
