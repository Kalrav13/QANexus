export interface UserCredentials {
  readonly username: string;
  readonly password: string;
}

export type LoginOutcome = 'success' | 'error' | 'validation';

export interface LoginScenario extends UserCredentials {
  readonly description: string;
  readonly expectedError?: string;
}

/** Resolved row used by data-driven login tests (from loginData.json). */
export interface LoginTestCase extends UserCredentials {
  readonly id: string;
  readonly description: string;
  readonly outcome: LoginOutcome;
  readonly expectedError?: string;
}

export interface UserRecord {
  readonly id?: number;
  readonly userName: string;
  readonly status?: string;
  readonly role?: string;
  readonly employeeName?: string;
}
