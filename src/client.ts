import jwt from 'jsonwebtoken';

import type { ClientSecretOpts } from '../@types';

import { ENDPOINT_URL } from './constants';


export const getClientSecret = (options: ClientSecretOpts): string => {
  if (!options.clientID) throw new Error('clientID is empty');
  if (!options.teamId) throw new Error('teamId is empty');
  if (!options.keyIdentifier) throw new Error('keyIdentifier is empty');
  if (!options.key) throw new Error('key must be provided');

  const timeNow = Math.floor(Date.now() / 1000);

  const claims = {
    iss: options.teamId,
    iat: timeNow,
    exp: timeNow + 15777000,
    aud: ENDPOINT_URL,
    sub: options.clientID,
  };

  const header = { alg: 'ES256', kid: options.keyIdentifier };
  console.log('inside func', jwt.sign)
  return jwt.sign(claims, options.key, { algorithm: 'ES256', header });
};
