export class HttpError extends Error {
  public readonly response: Response;

  constructor(message: string, response: Response) {
    super(message ?? response.statusText);
    this.name = this.constructor.name;
    this.response = response;
  }
}
