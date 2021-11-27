import HttpClient, { Middleware, RequestMethod } from '../src';
import nock from 'nock';

const Context = HttpClient.Context;
const baseURL = 'https://context.com/';
const scope = nock(baseURL).replyContentLength();

const contextMiddleware: Middleware = (ctx, next) =>
  next()
    .then(() => ctx)
    .catch(() => ctx);

const http = new HttpClient<{ (...args: Parameters<RequestMethod>): ReturnType<typeof contextMiddleware> }>({
  baseURL,
}).use(contextMiddleware);

test('create instance', () => {
  expect(new Context('')).toStrictEqual(expect.any(Context));
});

test('public field: request', () => {
  const url = '/request';
  const ctx = new Context(url);
  expect(ctx.request).toBeDefined();
  expect(ctx.request.url).toBe(url);
  expect(ctx.request.headers).toBeInstanceOf(Headers);
  expect(ctx.request.params).toBeInstanceOf(URLSearchParams);
});

test('public field: response', async () => {
  expect(new Context('').response).not.toBeDefined();
  const url = '/request';
  scope.get(url).reply(200);
  const ctx = await http.get(url);
  expect(ctx.response).toBeInstanceOf(Response);
  expect(ctx.response!.data).toBeDefined();
});

describe('getter', () => {
  test('success', async () => {
    const url = '/getter/success';
    scope.get(url).reply(200);
    const ctx = await http.get(url);
    expect(ctx.url).toBe(url);
    expect(ctx.method).toBe('GET');
    expect(ctx.status).toBe(200);
    expect(ctx.statusText).toBe('OK');
    expect(ctx.headers).toBeInstanceOf(Headers);
    expect(ctx.data).toBeDefined();
  });

  test('timeout', async () => {
    const url = '/getter/timeout';
    scope.get(url).delayConnection(50).reply(200);
    const ctx = await http.get(url, { timeout: 30 });
    expect(ctx.url).toBe(url);
    expect(ctx.method).toBe('GET');
    expect(ctx.status).toBeUndefined();
    expect(ctx.statusText).toBeUndefined();
    expect(ctx.headers).toBeUndefined();
    expect(ctx.data).toBeUndefined();
  });

  test('http error', async () => {
    const url = '/getter/http-error';
    const [code, body] = [500, 'Server Error'];
    scope.get(url).reply(code, body);
    const ctx = await http.get(url);
    expect(ctx.url).toBe(url);
    expect(ctx.method).toBe('GET');
    expect(ctx.status).toBe(code);
    expect(ctx.statusText).toBeDefined();
    expect(ctx.headers).toBeInstanceOf(Headers);
    expect(ctx.data).toBe(body);
  });
});
