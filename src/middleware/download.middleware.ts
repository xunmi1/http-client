import { Next, Context, DownloadResult } from '../interfaces';
import { isFunction } from '../utils';

const CONTENT_LENGTH = 'content-length';

export const downloadMiddleware = <T>(ctx: Context<T>, next: Next) => {
  const notice = ctx.request.onDownloadProgress;
  if (!isFunction(notice)) return next();
  const noticeSync = (params: DownloadResult) => Promise.resolve().then(() => notice(params));

  return next().then(() => {
    const total = Number(ctx.headers?.get(CONTENT_LENGTH)) ?? 0;
    const readableStream = ctx.response!.clone().body;
    if (!readableStream || readableStream.locked) return;

    let loaded = 0;
    const reader = readableStream.getReader();
    const read = () =>
      reader.read().then(({ value, done }) => {
        loaded += value?.length ?? 0;
        // Avoid blocking the current queue
        noticeSync({ total, loaded, value, done });
        if (!done) read();
      });

    return read();
  });
};
