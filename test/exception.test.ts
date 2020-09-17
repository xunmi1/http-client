import HttpClient from '../src';
import nock from 'nock';

const Exception = HttpClient.Exception;
const baseURL = 'https://exception.com/';
const scope = nock(baseURL).replyContentLength();
const http = new HttpClient({ baseURL });

test('HTTP_ERROR', () => {
  const url = '/http-error';
  scope.get(url).reply(404);
  expect.hasAssertions();
  return http.get(url).catch(error => {
    expect(error).toBeInstanceOf(Exception);
    expect(error.name).toBe(Exception.HTTP_ERROR);
  });
});

test('ABORT_ERROR', () => {
  const url = '/abort-error';
  scope.get(url).delayConnection(40).reply(200);
  const controller = new AbortController();
  setTimeout(() => controller.abort(), 20);
  expect.hasAssertions();
  return http.get(url, { signal: controller.signal }).catch(error => {
    expect(error).toBeInstanceOf(Exception);
    expect(error.name).toBe(Exception.ABORT_ERROR);
  });
});

test('TIMEOUT_ERROR', () => {
  const url = '/timeout-error';
  scope.get(url).delayConnection(40).reply(200);
  expect.hasAssertions();
  return http.get(url, { timeout: 20 }).catch(error => {
    expect(error).toBeInstanceOf(Exception);
    expect(error.name).toBe(Exception.TIMEOUT_ERROR);
  });
});

test('unknown responseType', () => {
  const url = '/unknown-parse';
  scope.get(url).reply(200);
  expect.hasAssertions();
  // @ts-ignore
  return http.get(url, { responseType: 'unknown' }).catch(error => {
    expect(error).toBeInstanceOf(Exception);
    expect(error.name).toBe('TypeError');
  });
});
