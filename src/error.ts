import type Context from "./context";

export class HttpError<T> extends Error {
  public readonly context;

  constructor(message: string, context: Context<T>) {
    super(message ?? context.statusText);
    this.name = this.constructor.name;
    this.context = context;
  }
}

export class TimeoutError<T> extends Error {
  public readonly context;

  constructor(message: string, context: Context<T>) {
    super(message);
    this.name = this.constructor.name;
    this.context = context;
  }
}
