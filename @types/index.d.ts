interface BaseAuthorization {
  clientID: string;
  redirectUri: string;
}

export interface AuthUrlOptions extends BaseAuthorization {
  state?: string;
  response_mode?: string;
  scope?: string;
  response_type?: string;
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

interface PubKey {
  kty: string;
  kid: string;
  use: string;
  alg: string;
  n: string;
  e: string;
}

export interface PublicKeysResponse {
  keys: PubKey[];
}
