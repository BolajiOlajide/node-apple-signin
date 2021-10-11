import fetch from 'node-fetch';
import NodeRSA from 'node-rsa';
import jwt from 'jsonwebtoken';
import { URL } from 'url';

import { ENDPOINT_URL, TOKEN_ISSUER } from './constants';

import type { RefreshAuthOptions, PublicKeysResponse } from '../@types';


export const getApplePublicKey = async (): Promise<string> => {
  const url = new URL(ENDPOINT_URL);
  url.pathname = '/auth/keys';

  const res = await fetch(url.toString());

  if (res.ok) {
    const data = await res.json();
    const { keys } = data as PublicKeysResponse;
    const [key] = keys;

    const pubKey = new NodeRSA();
    pubKey.importKey({ n: Buffer.from(key.n, 'base64'), e: Buffer.from(key.e, 'base64') }, 'components-public');
    return pubKey.exportKey('public');
  }

  return Promise
    .reject({ message: 'unable to fetch apple\'s public keys' });
};

export const verifyIdToken = async (idToken: string, clientID: string): Promise<jwt.JwtPayload> => {
  const applePublicKey = await getApplePublicKey();
  const jwtClaims = jwt.verify(idToken, applePublicKey, { algorithms: ['RS256'] }) as jwt.JwtPayload;

  if (jwtClaims.iss !== TOKEN_ISSUER) {
    const errorMessage = 'JWT issuer is invalid. Please provide JWT issued by Apple';
    return Promise.reject({ message: errorMessage });
  }

  if (clientID !== undefined && jwtClaims.aud !== clientID) {
    const errorMessage = 'JWT audience is invalid for this client';
    return Promise.reject({ message: errorMessage });
  }

  const hasJWTExpired = jwtClaims.exp === undefined || jwtClaims.exp < (Date.now() / 1000);
  if (hasJWTExpired) {
    return Promise.reject({ message: 'JWT token provided has expired' });
  }

  return jwtClaims;
};

export const refreshAuthorizationToken = async (refreshToken: string, options: RefreshAuthOptions): Promise<unknown> => {
  if (!options.clientID) {
    return Promise.reject({ message: 'clientID must be provided for refresh token authorization' });
  }

  if (!options.clientSecret) {
    return Promise.reject({ message: 'clientSecret must be provided for refresh token authorization' });
  }

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

  if (res.ok) {
    return res.json()
  }

  const errorMessage = await res.json();
  return Promise.reject(errorMessage);
};
