import { Next, Context, ResponseType } from '../interfaces';
import { Exception } from '../exception';

const parse = <T>(response: Response, type: ResponseType): Promise<T> => {
  const cloned = response.clone();
  if (type === 'json') {
    // response data may be an empty string
    return cloned.text().then(data => data && JSON.parse(data));
  }
  return (cloned[type]() as unknown) as Promise<T>;
};

export const parseFetchMiddleware = <T>(ctx: Context<T>, next: Next) => {
  const type = ctx.request.responseType ?? 'json';

  return next().then(
    (): Promise<void> => {
      const response = ctx.response!;

      if (!response.ok) {
        const message = `Request failed with status code ${ctx.status}.`;
        throw new Exception(message, Exception.Types.HTTP_ERROR, ctx);
      }

      return parse<T>(response, type)
        .then(data => {
          response.data = data;
        })
        .catch(error => {
          throw new Exception(error, Exception.Types.PARSE_ERROR, ctx);
        });
    }
  );
};
