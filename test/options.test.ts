import HttpClient from '../src';
import nock from 'nock';

const baseURL = 'https://merge.com';
const scope = nock(baseURL).replyContentLength();

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

    const url = '/default-request';
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
    const url = '/request-url';
    const urlWithParams = `${url}?x=1&y=1&z=`;
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
