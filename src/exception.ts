import Context from './context';

enum ExceptionNames {
  HTTP_ERROR = 'HttpError',
  TIMEOUT_ERROR = 'TimeoutError',
  PARSE_ERROR = 'ParseError',
}

export class Exception<T> extends Error {
  public static readonly Names = ExceptionNames;
  public readonly context;
  public readonly name;

  constructor(message: string, name: ExceptionNames, context: Context<T>) {
    super(message);
    this.name = name;
    this.context = context;
  }
}
