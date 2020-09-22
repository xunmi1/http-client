# @xunmi/http-client

[![ci](https://img.shields.io/github/workflow/status/xunmi1/http-client/CI?style=flat-square&logo=github)](https://github.com/xunmi1/http-client/actions?query=workflow%3ACI)
[![codecov](https://img.shields.io/codecov/c/github/xunmi1/http-client?style=flat-square&logo=codecov)](https://codecov.io/gh/xunmi1/http-client)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@xunmi/http-client?style=flat-square)](https://www.npmjs.com/package/@xunmi/http-client)
[![npm version](https://img.shields.io/npm/v/@xunmi/http-client?&style=flat-square&logo=npm)](https://www.npmjs.com/package/@xunmi/http-client)

An HTTP client based on the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).

- Parameter serialization
- Transform response data
- Timeout support
- Middleware support
- Download progress support

## Install

- NPM

  ```bash
  npm install @xunmi/http-client
  # or
  yarn add @xunmi/http-client
  ```

- CDN

  ```html
  <script src="https://cdn.jsdelivr.net/npm/@xunmi/http-client/dist/http-client.umd.min.js"></script>
  ```

## Usage

```js
import HttpClient from '@xunmi/http-client';

const httpClient = new HttpClient({ baseURL: 'https://api.example.com/' });

httpClient
  .get('resource')
  .then(result => {
    // do something
  })
  .catch(error => {
    // handle error
  });
```

## Request method aliases

Provide method aliases

```js
import HttpClient from '@xunmi/http-client';
const httpClient = new HttpClient(options);

httpClient.request(url, options);

httpClient.get(url, options);

httpClient.post(url, options);

httpClient.delete(url, options);

httpClient.put(url, options);

httpClient.patch(url, options);

httpClient.head(url, options);

httpClient.options(url, options);
```

## Request Options

`RequestOptions` is an extension of [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request) parameters.

```ts
interface RequestOptions extends RequestInit {
  // Request method.
  // The default is 'GET'.
  method?: string;

  // The request credentials you want to use for the request.
  // The default is 'same-origin'.
  credentials?: 'include' | 'omit' | 'same-origin';

  // The type of data that the server will respond.
  // The default is 'json'.
  responseType?: 'json' | 'text' | 'arrayBuffer' | 'blob' | 'formData';

  // The `baseURL` to use in case url is a relative URL.
  baseURL?: string;

  // The data to be sent as the request body.
  // It will be serialized automatically when is a plain object.
  // When using the `body` option at the same time, use `body` first.
  data?: Record<string | number, any> | any[] | BodyInit;

  // The URL parameters to be sent with the request.
  // It will append when `url` contains parameters.
  params?: Record<string | number, any> | any[][] | string | URLSearchParams;

  // The number of milliseconds a request can take before automatically being terminated.
  // The default is `undefined` (no timeout).
  timeout?: number;

  // Download progress event handler.
  onDownloadProgress?: (event: { total: number; loaded: number; done: boolean; value?: any; }) => void;
}
```

## Middleware

In order to facilitate request processing and functional extension, 
HttpClient used a middleware model.

Example:

- Logger middleware.

  ```js
  const httpClient = new HttpClient();

  // Logger middleware
  httpClient.use(async (ctx, next) => {
    const start = Date.now();
    const result = await next();
    const cost = Date.now() - start;
    console.log(`${ctx.method} ${ctx.url} - ${cost}ms`);
    return result;
  });
  ```

- Use middleware to get [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) object.

  > The final return value depends on the first middleware.

  ```js
  httpClient.use((ctx, next) => next().then(() => ctx.response));

  httpClient
    .get('resource')
    .then(result => {  
      console.log(result instanceof Response); // true
    })
  ```

### Context

Each middleware receives a `HttpClient.Context` object 
that encapsulates an incoming request options and the corresponding response.

```ts
httpClient.use((ctx: Context, next: Next) => next());
```

- ctx.request: Request options after conversion.

  ```ts
  export interface ContextRequest {
    url: string;
    params: URLSearchParams;
    headers: Headers;
    // ...
  }
  ```

- ctx.response: `Response` object, and attached the converted response option (`data`).

- Request aliases (getter):

  - `ctx.url`
  - `ctx.method`

- Response aliases (getter):

  - `ctx.status`
  - `ctx.statusText`
  - `ctx.headers`
  - `ctx.data`
