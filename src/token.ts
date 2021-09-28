import fetch from 'node-fetch';
import NodeRSA from 'node-rsa';
import jwt from 'jsonwebtoken';

import { ENDPOINT_URL, TOKEN_ISSUER } from './constants';

import type { RefreshAuthOptions } from '../@types';


export const getApplePublicKey = async () => {
  const url = new URL(ENDPOINT_URL);
  url.pathname = '/auth/keys';

  const res = await fetch(url.toString());
  const data = await res.json();
  const [key] = data as Array<Record<string, string>>;

  const pubKey = new NodeRSA();
  pubKey.importKey({ n: Buffer.from(key.n, 'base64'), e: Buffer.from(key.e, 'base64') }, 'components-public');
  return pubKey.exportKey('public');
};

export const verifyIdToken = async (idToken: string, clientID: string): Promise<jwt.JwtPayload> => {
  const applePublicKey = await getApplePublicKey();
  const jwtClaims = jwt.verify(idToken, applePublicKey, { algorithms: ['RS256'] }) as jwt.JwtPayload;

  if (jwtClaims.iss !== TOKEN_ISSUER) throw new Error('id token not issued by correct OpenID provider - expected: ' + TOKEN_ISSUER + ' | from: ' + jwtClaims.iss);
  if (clientID !== undefined && jwtClaims.aud !== clientID) throw new Error('aud parameter does not include this client - is: ' + jwtClaims.aud + '| expected: ' + clientID);
  if (jwtClaims.exp && (jwtClaims.exp < (Date.now() / 1000))) throw new Error('id token has expired');

  return jwtClaims;
};

export const refreshAuthorizationToken = async (refreshToken: string, options: RefreshAuthOptions): Promise<unknown> => {
  if (!options.clientID) throw new Error('clientID is empty');
  if (!options.clientSecret) throw new Error('clientSecret is empty');

  const url = new URL(ENDPOINT_URL);
  url.pathname = '/auth/token';

  const body = JSON.stringify({
    client_id: options.clientID,
    client_secret: options.clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });

  const res = await fetch(url.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    method: 'POST',
    body
  });
  return res.json();
};
