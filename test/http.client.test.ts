import HttpClient from '../src';
import nock from 'nock';

import { version } from '../package.json';

test('create instance', async () => {
  expect(new HttpClient()).toStrictEqual(expect.any(HttpClient));
});

describe('request method', () => {
  const baseURL = 'https://api.myservice.com/';
  const scope = nock(baseURL).replyContentLength();
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
    // @ts-ignore
    expect(() => HttpClient.use('')).toThrow(TypeError);
  });

  test('use middleware', async () => {
    const [baseURL, url] = ['https://api.myservice.com/', '/middleware/instance'];
    nock(baseURL).get(url).times(2).reply(200);

    const mockMiddleware = jest.fn((ctx: any, next: any) => next());

    const http1 = new HttpClient({ baseURL }).use(mockMiddleware);
    const http2 = new HttpClient({ baseURL });
    await http1.get(url);
    await http2.get(url);

    expect(mockMiddleware.mock.calls.length).toBe(1);
    expect(mockMiddleware).toBeCalledWith(expect.any(HttpClient.Context), expect.any(Function));
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
