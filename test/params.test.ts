import HttpClient from '../src';
import nock from 'nock';

const baseURL = 'https://params.com/';
const scope = nock(baseURL).replyContentLength();

const startQueryServer = (url: string) => {
  scope
    .get(url)
    .query(true)
    .reply(200, (v: string) => v.slice(url.length + 1));
};

describe('type of params', () => {
  test('type of defaults params is URLSearchParams', () => {
    // @ts-ignore
    expect(new HttpClient().defaults.params).toBeInstanceOf(URLSearchParams);
  });

  const http = new HttpClient({ baseURL });

  test('plain object', async () => {
    const params = { a: null, b: 1, c: false, d: '', e: undefined, f: { a: { b: 1 } }, g: [1, 2] };
    startQueryServer('/plain-object');
    const { data } = await http.get('/plain-object', { params });
    const received = new URLSearchParams(data);
    expect(received.getAll('a')).toEqual(['']);
    expect(received.getAll('b')).toEqual(['1']);
    expect(received.getAll('c')).toEqual(['false']);
    expect(received.getAll('d')).toEqual(['']);
    expect(received.getAll('e')).toEqual([]);
    expect(received.getAll('f')).toEqual([]);
    expect(received.getAll('f[a]')).toEqual([]);
    expect(received.getAll('f[a][b]')).toEqual(['1']);
    expect(received.getAll('g')).toEqual(['1', '2']);
  });

  test('two-dimensional array', async () => {
    const params = [
      ['a', '1'],
      ['a', '2'],
      ['b', ''],
    ];
    const url = '/two-dimensional-array';
    startQueryServer(url);
    const { data } = await http.get(url, { params });
    const received = new URLSearchParams(data);
    expect(received.getAll('a')).toEqual(['1', '2']);
    expect(received.getAll('b')).toEqual(['']);
  });

  test('URLSearchParams', async () => {
    const params = new URLSearchParams([
      ['a', '1'],
      ['a', '2'],
      ['b', ''],
    ]);
    const url = '/url-search-params';
    startQueryServer(url);
    const { data } = await http.get(url, { params });
    const received = new URLSearchParams(data);
    expect(received.getAll('a')).toEqual(['1', '2']);
    expect(received.getAll('b')).toEqual(['']);
  });

  test('string', async () => {
    const params = 'x=1&x=2';
    const url = '/string';
    startQueryServer(url);
    const { data } = await http.get(url, { params });
    expect(data).toBe(params);
  });
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
