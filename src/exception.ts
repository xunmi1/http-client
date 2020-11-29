import { Context } from './context';

export class Exception<C = Context> extends Error {
  public readonly context;

  public static readonly HTTP_ERROR = 'HttpError';
  public static readonly ABORT_ERROR = 'AbortError';
  public static readonly TIMEOUT_ERROR = 'TimeoutError';
  public static readonly PARSE_ERROR = 'ParseError';
  public static readonly TYPE_ERROR = 'TypeError';

  constructor(error: string | Error, name: string, context: C) {
    super(error instanceof Error ? error.message : error);
    this.name = name;
    this.context = context;
  }
}
