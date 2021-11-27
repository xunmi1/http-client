import HttpClient, { Next } from '../src';
import nock from 'nock';

const baseURL = 'https://timeout.com/';
const scope = nock(baseURL).replyContentLength();
const Exception = HttpClient.Exception;

describe('timeout option', () => {
  test('merge timeout option', async () => {
    const defaultTimeout = 10000;
    const http = new HttpClient({ baseURL, timeout: defaultTimeout });
    // @ts-ignore
    expect(http.defaults.timeout).toBe(defaultTimeout);

    const mockMiddleware = jest.fn((_, next: Next) => next());
    http.use(mockMiddleware);
    const [timeout, url] = [15000, '/merge'];
    scope.get(url).reply(200);
    await http.get(url, { timeout });
    const ctx = mockMiddleware.mock.calls[0][0];
    expect(ctx.request.timeout).toBe(timeout);
  });

  test('timeout must be a number', async () => {
    const http = new HttpClient({ baseURL });
    expect.hasAssertions();
    try {
      // @ts-ignore
      await http.get('/number', { timeout: '' });
    } catch (err) {
      expect(err).toBeInstanceOf(Exception);
      expect((err as typeof Exception).name).toBe('TypeError');
    }
  });

  test('timeout must be within a safe value range', async () => {
    expect.hasAssertions();
    const http = new HttpClient({ baseURL });

    try {
      await http.get('unsafe-lower', { timeout: -1 });
    } catch (err) {
      expect((err as Error).name).toBe('RangeError');
    }

    try {
      await http.get('unsafe-upper', { timeout: 2 ** 31 });
    } catch (err) {
      expect((err as Error).name).toBe('RangeError');
    }
  });

  test('should throw a timeout exception', async () => {
    expect.hasAssertions();
    const http = new HttpClient({ baseURL });
    const url = '/timed';
    scope.get(url).delayConnection(40).reply(200);

    try {
      await http.get(url, { timeout: 20 });
    } catch (err) {
      expect(err).toBeInstanceOf(Exception);
      expect((err as typeof Exception).name).toBe(Exception.TIMEOUT_ERROR);
    }
  });
});

describe('timeout and abort', () => {
  test('abort request before timeout', async () => {
    const controller = new AbortController();
    const http = new HttpClient({ baseURL });
    const url = '/early-abort';
    scope.get(url).delayConnection(40).reply(200);
    expect.hasAssertions();
    try {
      setTimeout(() => controller.abort(), 20);
      await http.get(url, { timeout: 30, signal: controller.signal });
    } catch (err) {
      expect(err).toBeInstanceOf(Exception);
      expect((err as typeof Exception).name).toBe(Exception.ABORT_ERROR);
    }
  });

  test('abort request after timeout', async () => {
    const controller = new AbortController();
    const http = new HttpClient({ baseURL });
    const url = '/delay-abort';
    scope.get(url).delayConnection(40).reply(200);
    expect.hasAssertions();
    try {
      setTimeout(() => controller.abort(), 30);
      await http.get(url, { timeout: 20, signal: controller.signal });
    } catch (err) {
      expect(err).toBeInstanceOf(Exception);
      expect((err as typeof Exception).name).toBe(Exception.TIMEOUT_ERROR);
    }
  });
});
