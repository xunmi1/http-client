import HttpClient, { HttpClientOptions, Next, DownloadProgressEvent } from '../src';
import nock from 'nock';

const Exception = HttpClient.Exception;
const baseURL = 'https://merge.com/';
const scope = nock(baseURL).replyContentLength();

describe('url', () => {
  const startURLServer = (url: string) => {
    scope.get(url).reply(200, v => v);
  };

  test('only has url', async () => {
    const http = new HttpClient();
    const url = '/url/only-url';
    startURLServer(url);
    const { data } = await http.get('https://merge.com/url/only-url', { responseType: 'text' });
    expect(data).toBe(url);
  });

  test('url and baseURL', async () => {
    const http = new HttpClient({ baseURL: baseURL + 'url/' });
    const url = '/url/url-base';
    startURLServer(url);
    const { data } = await http.get('url-base', { responseType: 'text' });
    expect(data).toBe(url);
  });

  test('url has hash', async () => {
    const http = new HttpClient();
    const url = '/url/hash';
    startURLServer(url);
    const { data } = await http.get('https://merge.com/url/hash#a', { responseType: 'text' });
    expect(data).toBe(url);
  });
});

describe('method', () => {
  test('default is `GET`', () => {
    // @ts-ignore
    expect(new HttpClient().defaults.method).toBe('GET');
  });

  test('merge default method and request method', async () => {
    const http = new HttpClient({ baseURL, method: 'post' });
    // @ts-ignore
    expect(http.defaults.method).toBe('POST');
    scope.delete('/method').reply(204);
    let result = await http.delete('/method');
    expect(result.status).toEqual(204);

    scope.get('/method').reply(200);
    result = await http.request('/method', { method: undefined });
    expect(result.status).toEqual(200);
  });
});

describe('headers', () => {
  test('type of headers is Headers', () => {
    // @ts-ignore
    expect(new HttpClient().defaults.headers).toBeInstanceOf(Headers);
  });

  test('merge default headers and request headers', async () => {
    const url = '/headers/default-request';
    scope.get(url).reply(200);
    const mockMiddleware = jest.fn((_, next: Next) => next());
    const http = new HttpClient({ baseURL, headers: { x: '1', y: '1' } }).use(mockMiddleware);
    await http.get(url, { headers: { x: '2' } });
    const headers: Headers = mockMiddleware.mock.calls[0][0].request.headers;
    expect(headers.get('x')).toBe('2');
    expect(headers.get('y')).toBe('1');
  });
});

const startBodyServer = (url: string) => {
  scope.post(url).reply(200, (_, body) => body);
};

describe('data', () => {
  test('object type', async () => {
    const http = new HttpClient({ baseURL });
    const url = '/data/merge-object';
    startBodyServer(url);
    const data = { x: 2, z: [2, { z: null }] };
    const req = await http.post(url, { data });
    expect(req.data).toStrictEqual(data);
  });

  test('primitive type', async () => {
    const http = new HttpClient({ baseURL });
    const url = '/data/merge-primitive';
    startBodyServer(url);
    const { data } = await http.post(url, { data: 1 });
    expect(data).toBe(1);
  });

  test('support bigint type', async () => {
    const http = new HttpClient({ baseURL });
    const url = '/data/bigint';
    const max = BigInt(Number.MAX_VALUE);
    startBodyServer(url);
    const { data } = await http.post(url, { data: { a: max } });
    expect(data).toEqual({ a: max.toString() });
  });

  test('use body first', async () => {
    const http = new HttpClient({ baseURL });
    const url = '/data/request-body';
    const body = { x: 'requestBody' };
    startBodyServer(url);
    const { data } = await http.post(url, { body: JSON.stringify({ x: 'requestBody' }), data: { x: 'requestData' } });
    expect(data).toEqual(body);
  });

  test('type of data is not JSON', async () => {
    const http = new HttpClient({ baseURL });
    const [url, requestData] = ['/data/no-json', new ArrayBuffer(10)];
    startBodyServer(url);
    const { data } = await http.post(url, { data: requestData, responseType: 'arrayBuffer' });
    expect(data.byteLength).toBe(requestData.byteLength);
  });

  test('ignore default `data` option', async () => {
    const defaultData = { x: 1, y: 1 };
    const http = new HttpClient({ baseURL, data: defaultData } as HttpClientOptions);
    const url = '/data/default-data';
    startBodyServer(url);
    let req = await http.post(url);
    expect(req.data).toBe('');

    startBodyServer(url);
    const data = { x: 2 };
    req = await http.post(url, { data });
    expect(req.data).toStrictEqual(data);
  });
});

describe('onDownloadProgress', () => {
  test('onDownloadProgress must be a function', async () => {
    const http = new HttpClient({ baseURL });
    expect.hasAssertions();
    try {
      await http.get('download-progress/function', { onDownloadProgress: (-1 as any) as DownloadProgressEvent });
    } catch (err) {
      expect(err).toBeInstanceOf(Exception);
      expect(err.name).toBe('TypeError');
    }
  });

  test('should be called multiple times', async () => {
    const http = new HttpClient({ baseURL });
    const [url, body] = ['/download', 'x1234567890'];
    scope.get(url).reply(200, body);
    const onDownloadProgress = jest.fn();
    const { data } = await http.get(url, { onDownloadProgress });
    expect(data).toBe(body);
    const calls = onDownloadProgress.mock.calls;
    expect(calls[0][0].done).toBe(false);
    expect(calls[calls.length - 1][0].done).toBe(true);
  });
});
