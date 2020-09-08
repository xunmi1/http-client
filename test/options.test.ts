import HttpClient, { Exception } from '../src';
import nock from 'nock';

describe('merge options', () => {
  test('method', async () => {
    // @ts-ignore
    expect(new HttpClient().defaults.method).toBe('GET');
    const http = new HttpClient({ method: 'post' });
    // @ts-ignore
    expect(http.defaults.method).toBe('POST');
    try {
      await http.delete('https://merge.com');
    } catch (e) {
      expect((e as Exception).context.method).toBe('DELETE');
    }
  });

  test('params', async () => {
    // @ts-ignore
    expect(new HttpClient().defaults.params).toBeInstanceOf(URLSearchParams);

    const baseURL = 'https://merge.com';
    const params = { x: 1, y: [1, { z: { z1: 1 } }, null, undefined] };

    const http = new HttpClient({ baseURL, params });
    // @ts-ignore
    const defaultParams = http.defaults.params as URLSearchParams;
    expect(defaultParams.getAll('x')).toEqual(['1']);
    expect(defaultParams.getAll('y')).toEqual(['1', '']);
    expect(defaultParams.getAll('y[z][z1]')).toEqual(['1']);

    const url = '/params';
    nock(baseURL)
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
