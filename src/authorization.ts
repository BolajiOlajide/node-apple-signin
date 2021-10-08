import { URL } from 'url';
import fetch from 'node-fetch';

import type { AuthUrlOptions, AuthTokenOptions } from '../@types';

import { ENDPOINT_URL, DEFAULT_SCOPE } from './constants';


export const getAuthorizationUrl = (options: AuthUrlOptions): string => {
  if (!options.clientID) throw Error('clientID is empty');
  if (!options.redirectUri) throw Error('redirectUri is empty');

  const url = new URL(ENDPOINT_URL);
  url.pathname = '/auth/authorize';

  url.searchParams.append('response_type', options.response_type || 'code');
  url.searchParams.append('state', options.state || 'state');
  url.searchParams.append('client_id', options.clientID);
  url.searchParams.append('redirect_uri', options.redirectUri);
  url.searchParams.append('response_mode', options.response_mode || 'form_post');

  if (options.scope) {
    url.searchParams.append('scope',  options.scope || DEFAULT_SCOPE);
  }

  return url.toString();
};

export const getAuthorizationToken = async (code: string, options: AuthTokenOptions): Promise<unknown> => {
  if (!options.clientID) {
    return Promise.reject({ message: 'clientID is empty' });
  }

  if (!options.redirectUri) {
    return Promise.reject({ message: 'redirectUri is empty' });
  }

  if (!options.clientSecret) {
    return Promise.reject({ message: 'clientSecret is empty' });
  }

  const url = new URL(ENDPOINT_URL);
  url.pathname = '/auth/token';

  const body = JSON.stringify({
    client_id: options.clientID,
    client_secret: options.clientSecret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: options.redirectUri,
  });

  const res = await fetch(url.toString(), {
    method: 'POST',
    body,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  if (res.ok) {
    return res.json();
  }

  const errorMessage = await res.json();
  return Promise.reject(errorMessage);
};
