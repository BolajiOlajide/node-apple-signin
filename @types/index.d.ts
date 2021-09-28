interface BaseAuthorization {
  clientID: string;
  redirectUri: string;
}

export interface AuthUrlOptions extends BaseAuthorization {
  state?: string;
  response_mode?: string;
  scope?: string;
}

export interface AuthTokenOptions extends BaseAuthorization {
  clientSecret: string;
}

export interface ClientSecretOpts {
  clientID: string;
  teamId: string;
  keyIdentifier: string;
  key: string;
}

export interface RefreshAuthOptions {
  clientID: string;
  clientSecret: string;
}
