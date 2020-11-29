import { Middleware, DownloadProgressEvent } from '../interfaces';
import { toRawType, isFunction, asyncify } from '../utils';

const isNode = typeof process !== 'undefined' && toRawType(process) === 'process';

const CONTENT_LENGTH = 'content-length';

/* istanbul ignore next */
const rendStreamBrowser = (response: Response, notice: DownloadProgressEvent) => {
  const total = Number(response.headers?.get(CONTENT_LENGTH)) ?? 0;
  const readableStream = response.body;
  if (!readableStream || readableStream.locked) return;
  let loaded = 0;
  const reader = readableStream.getReader();
  const read = (): Promise<void> =>
    reader.read().then(({ value, done }) => {
      loaded += value?.length ?? 0;
      notice({ total, loaded, value, done });
      if (!done) return read();
    });

  return read();
};

/**
 * Because the total size cannot be obtained when in node environment, `total` will be equal to `loaded`.
 * @see https://github.com/node-fetch/node-fetch#interface-body
 */
const rendStreamNode = (response: { body?: any }, notice: DownloadProgressEvent<Buffer>) => {
  const readableStream = response.body;
  /* istanbul ignore if */
  if (!readableStream?.readable) return;
  let loaded = 0;
  return new Promise<void>((resolve, reject) => {
    readableStream.on('readable', () => {
      let value: Buffer;
      while ((value = readableStream.read())) {
        loaded += value.length;
        notice({ total: loaded, loaded, value, done: false });
      }
    });
    readableStream.on('end', () => {
      notice({ total: loaded, loaded, done: true });
      resolve();
    });
    readableStream.on('close', resolve);
    readableStream.on('error', reject);
  });
};

/**
 * Implement `onDownloadProgress` feature
 */
export const downloadMiddleware: Middleware = (ctx, next) => {
  const notice = ctx.request.onDownloadProgress;
  if (notice == null) return next();
  if (!isFunction(notice)) {
    throw new TypeError('The onDownloadProgress option must be a function');
  }
  // Avoid blocking the current queue
  const noticeAsync = asyncify(notice);

  return next().then(() => {
    const response = ctx.response!.clone();
    return (isNode ? rendStreamNode : /* istanbul ignore next */ rendStreamBrowser)(response, noticeAsync);
  });
};
