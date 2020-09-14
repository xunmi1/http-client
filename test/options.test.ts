import HttpClient from '../src';
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
  test('type of method is string', () => {
    // @ts-ignore
    expect(new HttpClient().defaults.method).toBe('GET');
  });

  test('merge default method and request method', async () => {
    const http = new HttpClient({ baseURL, method: 'post' });
    // @ts-ignore
    expect(http.defaults.method).toBe('POST');
    scope.delete('/method').reply(204);
    const { status } = await http.delete('/method');
    expect(status).toEqual(204);
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
    const mockMiddleware = jest.fn((ctx: any, next: any) => next());
    const http = new HttpClient({ baseURL, headers: { x: '1', y: '1' } }).use(mockMiddleware);
    await http.get(url, { headers: { x: '2' } });
    const headers: Headers = mockMiddleware.mock.calls[0][0].request.headers;
    expect(headers.get('x')).toBe('2');
    expect(headers.get('y')).toBe('1');
  });
});

describe('params', () => {
  const startQueryServer = (url: string) => {
    scope
      .get(url)
      .query(true)
      .reply(200, (v: string) => v.slice(url.length));
  };

  test('type of params is URLSearchParams', () => {
    // @ts-ignore
    expect(new HttpClient().defaults.params).toBeInstanceOf(URLSearchParams);
  });

  test('merge default params and request params', async () => {
    const params = { x: 1, y: [1, { z: { z1: 1 } }, null, undefined] };
    const http = new HttpClient({ baseURL, params });
    // @ts-ignore
    const defaultParams = http.defaults.params as URLSearchParams;
    expect(defaultParams.getAll('x')).toEqual(['1']);
    expect(defaultParams.getAll('y')).toEqual(['1', '']);
    expect(defaultParams.getAll('y[z]')).toEqual([]);
    expect(defaultParams.getAll('y[z][z1]')).toEqual(['1']);

    const url = '/params/default-request';
    startQueryServer(url);
    const { data } = await http.get(url, { params: { x: 2, y: [2, { z: 2 }] }, responseType: 'text' });
    const receivedParams = new URLSearchParams(data);
    expect(receivedParams.getAll('x')).toEqual(['2']);
    expect(receivedParams.getAll('y')).toEqual(['2']);
    expect(receivedParams.getAll('y[z]')).toEqual(['2']);
    expect(receivedParams.getAll('y[z][z1]')).toEqual(['1']);
  });

  test('merge request params and url params', async () => {
    const http = new HttpClient({ baseURL });
    const url = '/params/request-url';
    const urlWithParams = `${url}?x=1&y=1&z=#a`;
    const params = { x: 2, y: [2, 3] };
    startQueryServer(url);
    const { data } = await http.get(urlWithParams, { params, responseType: 'text' });
    const receivedParams = new URLSearchParams(data);
    expect(receivedParams.getAll('x')).toEqual(['1', '2']);
    expect(receivedParams.getAll('y')).toEqual(['1', '2', '3']);
    expect(receivedParams.getAll('z')).toEqual(['']);
  });
});

describe('data', () => {
  const startBodyServer = (url: string) => {
    scope.post(url).reply(200, (_, body) => body);
  };

  test('merge default data and request data', async () => {
    const defaultData = { x: 1, y: [1, { z: { z1: 1 } }] };
    const http = new HttpClient({ baseURL, data: defaultData });
    const url = '/data/default-request';
    startBodyServer(url);
    const { data } = await http.post(url, { data: { x: 2, y: [2, { z: undefined }] } });
    expect(data).toEqual({ x: 2, y: [2, { z: undefined }] });
  });

  test('use body first', async () => {
    const http = new HttpClient({ baseURL });
    const url = '/data/request-body';
    const requestData = { x: 'requestData' };
    const requestBody = JSON.stringify({ x: 'requestBody' });
    startBodyServer(url);
    const { data } = await http.post(url, { body: requestBody, data: requestData });
    expect(data).toEqual(JSON.parse(requestBody));
  });

  test('type of data is not JSON', async () => {
    const http = new HttpClient({ baseURL });
    const [url, requestData] = ['/data/no-json', new ArrayBuffer(10)];
    startBodyServer(url);
    const { data } = await http.post(url, { data: requestData, responseType: 'arrayBuffer' });
    expect(data.byteLength).toBe(requestData.byteLength);
  });
});

describe('timeout', () => {
  test('merge timeout option', async () => {
    const defaultTimeout = 10000;
    const http = new HttpClient({ baseURL, timeout: defaultTimeout });
    // @ts-ignore
    expect(http.defaults.timeout).toBe(defaultTimeout);

    const mockMiddleware = jest.fn((ctx: any, next: any) => next());
    http.use(mockMiddleware);
    const [timeout, url] = [15000, '/timeout/merge'];
    scope.get(url).reply(200);
    await http.get(url, { timeout });
    const ctx = mockMiddleware.mock.calls[0][0];
    expect(ctx.request.timeout).toBe(timeout);
  });

  test('timeout must be a number', async () => {
    const http = new HttpClient({ baseURL });
    try {
      // @ts-ignore
      await http.get('timeout/number', { timeout: '' });
    } catch (err) {
      expect(err).toBeInstanceOf(Exception);
      expect(err.name).toBe('TypeError');
    }
  });

  test('timeout must be within a safe value range', async () => {
    const http = new HttpClient({ baseURL });
    try {
      await http.get('timeout/unsafe', { timeout: -1 });
    } catch (err) {
      expect(err).toBeInstanceOf(Exception);
      expect(err.name).toBe('RangeError');
    }
  });

  test('timed out', async () => {
    const http = new HttpClient({ baseURL });
    const url = '/timeout/timed';
    scope.get(url).delayConnection(80).reply(200);
    try {
      await http.get(url, { timeout: 40 });
    } catch (err) {
      expect(err).toBeInstanceOf(Exception);
      expect(err.name).toBe(Exception.TIMEOUT_ERROR);
    }
  });

  test('early abort request with timeout', async () => {
    const controller = new AbortController();
    const http = new HttpClient({ baseURL });
    const url = '/timeout/abort';
    scope.get(url).delayConnection(150).reply(200);
    try {
      setTimeout(() => controller.abort(), 50);
      await http.get(url, { timeout: 100, signal: controller.signal });
    } catch (err) {
      expect(err).toBeInstanceOf(Exception);
      expect(err.name).toBe(Exception.ABORT_ERROR);
    }
  });
});
