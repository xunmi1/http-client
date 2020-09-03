import { Next, Context } from '../interfaces';
import { isFunction, promisify } from '../utils';

const CONTENT_LENGTH = 'content-length';

/**
 * Implement `onDownloadProgress` feature
 */
export const downloadMiddleware = <T>(ctx: Context<T>, next: Next) => {
  const notice = ctx.request.onDownloadProgress;
  if (!notice || !isFunction(notice)) return next();

  const noticeAsync = promisify(notice);

  return next().then(() => {
    const total = Number(ctx.headers?.get(CONTENT_LENGTH)) ?? 0;
    const readableStream = ctx.response!.clone().body;
    if (!readableStream || readableStream.locked) return;

    let loaded = 0;
    const reader = readableStream.getReader();
    const read = (): Promise<undefined> =>
      reader.read().then(({ value, done }) => {
        loaded += value?.length ?? 0;
        // Avoid blocking the current queue
        noticeAsync({ total, loaded, value, done });
        if (!done) return read();
      });

    return read();
  });
};
