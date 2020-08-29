import Context from './context';

enum ExceptionTypes {
  HTTP_ERROR = 'HttpError',
  TYPE_ERROR = 'TypeError',
  ABORT_ERROR = 'AbortError',
  TIMEOUT_ERROR = 'TimeoutError',
  PARSE_ERROR = 'ParseError',
  UNKNOWN_ERROR = 'UnknownError'
}

export class Exception<T> extends Error {
  public static readonly Types = ExceptionTypes;
  public readonly context;
  public readonly type;

  constructor(error: string | Error, type: ExceptionTypes, context: Context<T>) {
    super(error instanceof Error ? error.message : error);
    this.name = this.constructor.name;
    this.type = type;
    this.context = context;
  }
}
