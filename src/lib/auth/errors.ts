/**
 * Thrown when a caller is missing or holds the wrong role. Carries an HTTP-ish
 * status so a route handler can map it without re-inspecting the message.
 */
export class AuthorizationError extends Error {
  readonly status: 401 | 403;

  constructor(message: string, status: 401 | 403) {
    super(message);
    this.name = "AuthorizationError";
    this.status = status;
  }
}
