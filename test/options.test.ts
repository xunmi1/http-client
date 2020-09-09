import HttpClient from '../src';
import nock from 'nock';

const baseURL = 'https://merge.com';
const scope = nock(baseURL).replyContentLength();

describe('method', () => {
  test('type of method is string', () => {
    // @ts-ignore
    expect(new HttpClient().defaults.method).toBe('GET');
  });

  test('merge method', async () => {
    const http = new HttpClient({ baseURL, method: 'post' });
    // @ts-ignore
    expect(http.defaults.method).toBe('POST');
    scope.delete('/method').reply(204);
    const { status } = await http.delete('/method');
    expect(status).toEqual(204);
  });
});

describe('params', () => {
  test('type of params is URLSearchParams', () => {
    // @ts-ignore
    expect(new HttpClient().defaults.params).toBeInstanceOf(URLSearchParams);
  });

  test('merge params', async () => {
    const params = { x: 1, y: [1, { z: { z1: 1 } }, null, undefined] };
    const http = new HttpClient({ baseURL, params });
    // @ts-ignore
    const defaultParams = http.defaults.params as URLSearchParams;
    expect(defaultParams.getAll('x')).toEqual(['1']);
    expect(defaultParams.getAll('y')).toEqual(['1', '']);
    expect(defaultParams.getAll('y[z]')).toEqual([]);
    expect(defaultParams.getAll('y[z][z1]')).toEqual(['1']);

    const url = '/params';
    scope
      .get(url)
      .query(true)
      .reply(200, v => v);
    const { data } = await http.get(url, { responseType: 'text', params: { x: 2, y: [2, { z: 2 }] } });
    const receivedParams = new URLSearchParams((data as string).slice(url.length));
    expect(receivedParams.getAll('x')).toEqual(['2']);
    expect(receivedParams.getAll('y')).toEqual(['2']);
    expect(receivedParams.getAll('y[z]')).toEqual(['2']);
    expect(receivedParams.getAll('y[z][z1]')).toEqual(['1']);
  });
});
