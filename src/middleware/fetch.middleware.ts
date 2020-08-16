import { Middleware } from '../interfaces';

const appendParams = (url: string, params: URLSearchParams) => {
  const result = new URL(url);
  // Append and not overwrite
  params.forEach((v, k) => result.searchParams.append(k, v));
  return result;
}

const fetchMiddleware: Middleware<void> = (ctx, next) => {
  const { url, params, ...options } = ctx.options;
  const { href } = appendParams(url, params);
  return fetch(href, options).then(res => {
    ctx.response = res;
    return next();
  });
}

export default fetchMiddleware;
