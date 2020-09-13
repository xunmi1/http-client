import { Context } from './context';

export class Exception<T = any> extends Error {
  public readonly context;

  public static readonly HTTP_ERROR = 'HttpError';
  public static readonly ABORT_ERROR = 'AbortError';
  public static readonly TIMEOUT_ERROR = 'TimeoutError';
  public static readonly PARSE_ERROR = 'ParseError';

  constructor(error: string | Error, name: string, context: Context<T>) {
    super(error instanceof Error ? error.message : error);
    this.name = name;
    this.context = context;
  }
}
