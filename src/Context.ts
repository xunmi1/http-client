import { RequestOptions } from './interfaces';

export interface ContextOptions extends RequestOptions {
  url: string;
}

class Context {
  constructor(options: ContextOptions) {

  }
}

export default Context;
