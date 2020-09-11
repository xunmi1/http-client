import 'cross-fetch/polyfill';
import nock from 'nock';

/**
 * Avoids memory-leaks
 * @see https://github.com/nock/nock/issues/1817
 */
afterAll(() => {
  nock.cleanAll();
  nock.restore();
});
