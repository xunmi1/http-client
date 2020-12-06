import HttpClient, { Next } from '../src';
import nock from 'nock';

import { version } from '../package.json';

const baseURL = 'https://api.myservice.com/';
const scope = nock(baseURL).replyContentLength();

test('create instance', async () => {
  expect(new HttpClient()).toStrictEqual(expect.any(HttpClient));
});

describe('request method', () => {
  const http = new HttpClient({ baseURL });
  const body = { text: 'hello world!' };

  test('request', async () => {
    const url = '/method/request';
    scope.get(url).reply(200, body);
    const { status, data } = await http.request(url);
    expect(data).toEqual(body);
    expect(status).toBe(200);
  });
  test('get', async () => {
    const url = '/method/get';
    scope.get(url).reply(200, body);
    const { data } = await http.get(url);
    expect(data).toEqual(body);
  });

  test('post', async () => {
    const url = '/method/post';
    scope.post(url).reply(201, body);
    const { data } = await http.post(url);
    expect(data).toEqual(body);
  });

  test('delete', async () => {
    const url = '/method/delete';
    scope.delete(url).reply(204);
    const { status } = await http.delete(url);
    expect(status).toEqual(204);
  });

  test('put', async () => {
    const url = '/method/put';
    scope.put(url).reply(201, body);
    const { data } = await http.put(url);
    expect(data).toEqual(body);
  });

  test('patch', async () => {
    const url = '/method/patch';
    scope.patch(url).reply(201, body);
    const { data } = await http.patch(url);
    expect(data).toEqual(body);
  });

  test('head', async () => {
    const url = '/method/head';
    scope.head(url).reply(200, body);
    const { data } = await http.head(url);
    expect(data).toEqual(body);
  });

  test('options', async () => {
    const url = '/method/options';
    scope.options(url).reply(200, body);
    const { data } = await http.options(url);
    expect(data).toEqual(body);
  });
});

describe('middleware', () => {
  test('middleware must be a function', () => {
    // @ts-ignore
    expect(() => new HttpClient().use('')).toThrow(TypeError);
  });

  test('use middleware', async () => {
    const url = '/middleware/instance';
    scope.get(url).times(2).reply(200);

    const mockMiddleware = jest.fn((_, next: Next) => next());

    const http1 = new HttpClient({ baseURL }).use(mockMiddleware);
    const http2 = new HttpClient({ baseURL });
    await http1.get(url);
    await http2.get(url);

    expect(mockMiddleware.mock.calls.length).toBe(1);
    expect(mockMiddleware).toBeCalledWith(expect.any(HttpClient.Context), expect.any(Function));
  });

  test('`next()` can only be called once in one middleware', async () => {
    const url = '/middleware/next';
    scope.get(url).reply(200);
    const http = new HttpClient({ baseURL });
    http.use(async (_, next) => {
      await next();
      await next();
    });
    await expect(http.get(url)).rejects.toThrow(Error);
  });
});

describe('other static properties', () => {
  test('version', () => {
    expect(HttpClient.version).toBe(version);
  });
  test('Model', () => {
    expect(HttpClient.Model).toBeInstanceOf(Function);
  });
  test('Exception', () => {
    expect(HttpClient.Exception).toBeInstanceOf(Function);
  });
  test('Context', () => {
    expect(HttpClient.Context).toBeInstanceOf(Function);
  });
  test('mergeOptions', () => {
    expect(HttpClient.mergeOptions).toBeInstanceOf(Function);
  });
  test('compose', () => {
    expect(HttpClient.compose).toBeInstanceOf(Function);
  });
});
