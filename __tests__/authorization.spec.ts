import fetch from 'node-fetch';

import * as AuthorizationService from '../src/authorization';


const { Response } = jest.requireActual('node-fetch');

describe('authorization', () => {
  describe('getAuthorizationUrl', () => {
    test('throws an error if clientID is falsy', () => {
      expect(() => AuthorizationService.getAuthorizationUrl({
        clientID: '',
        redirectUri: '',
        state: 'randomState',
        response_mode: 'form_post',
        scope: 'email name',
        response_type: 'code'
      })).toThrowError('clientID is empty');
    });

    test('throws an error if redirectUri is falsy', () => {
      expect(() => AuthorizationService.getAuthorizationUrl({
        clientID: 'CHD3280DS',
        redirectUri: '',
        state: 'randomState',
        response_mode: 'form_post',
        scope: 'email name',
        response_type: 'code'
      })).toThrowError('redirectUri is empty');
    });

    test('returns apple auth URL if all options are provided', () => {
      const url = AuthorizationService.getAuthorizationUrl({
        clientID: 'CHD3280DS',
        redirectUri: 'http://example.com',
        state: 'randomState',
        response_mode: 'form_post',
        scope: 'email name',
        response_type: 'code'
      });

      expect(url).toEqual('https://appleid.apple.com/auth/authorize?response_type=code&state=randomState&client_id=CHD3280DS&redirect_uri=http%3A%2F%2Fexample.com&response_mode=form_post&scope=email+name');
    });

    test('uses email scope if scope isn\'t provided in the argument', () => {
      const url = AuthorizationService.getAuthorizationUrl({
        clientID: 'CHD3280DS',
        redirectUri: 'http://example.com',
        state: 'randomState',
        response_mode: 'form_post',
        response_type: 'code'
      });

      expect(url).toEqual('https://appleid.apple.com/auth/authorize?response_type=code&state=randomState&client_id=CHD3280DS&redirect_uri=http%3A%2F%2Fexample.com&response_mode=form_post');
    });

    test('uses the default state if state isn\'t provided in the argument', () => {
      const url = AuthorizationService.getAuthorizationUrl({
        clientID: 'CHD3280DS',
        redirectUri: 'http://example.com',
        response_mode: 'form_post',
        response_type: 'code'
      });

      expect(url).toEqual('https://appleid.apple.com/auth/authorize?response_type=code&state=state&client_id=CHD3280DS&redirect_uri=http%3A%2F%2Fexample.com&response_mode=form_post');
    });
  });

  describe('getAuthorizationToken', () => {
    const code = 'randomCode';
    const authTokenOptions = {
      clientID: 'anotherClientID',
      clientSecret: 'anotherClientSecret',
      redirectUri: 'http://example.com'
    };

    test('returns a promise rejection if clientID is falsy', async () => {
      await expect(AuthorizationService.getAuthorizationToken(code, {
        clientID: '',
        clientSecret: '',
        redirectUri: ''
      }))
        .rejects
        .toEqual({ message: 'clientID is empty' });
    });

    test('returns a promise rejection if redirectUri is falsy', async () => {
      await expect(AuthorizationService.getAuthorizationToken(code, {
        clientID: 'CJDSDL',
        clientSecret: '',
        redirectUri: ''
      }))
        .rejects
        .toEqual({ message: 'redirectUri is empty' });
    });

    test('returns a promise rejection if clientSecret is falsy', async () => {
      await expect(AuthorizationService.getAuthorizationToken(code, {
        clientID: 'CJDSDL',
        clientSecret: '',
        redirectUri: 'http://example.com'
      }))
        .rejects
        .toEqual({ message: 'clientSecret is empty' });
    });

    test('returns the token received from Apple\'s auth service', async () => {
      (fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              token: 'newToken'
            })
          )
        );

      const token = await AuthorizationService.getAuthorizationToken(code, authTokenOptions);

      expect(token).toEqual({ token: 'newToken' });

      expect(fetch).toBeCalledTimes(1);
      expect(fetch).toBeCalledWith(
        'https://appleid.apple.com/auth/token',
        {
          method: 'POST',
          body: JSON.stringify({
            client_id: authTokenOptions.clientID,
            client_secret: authTokenOptions.clientSecret,
            code,
            grant_type: 'authorization_code',
            redirect_uri: authTokenOptions.redirectUri,
          }),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      )
    });

    test('returns the error message from Apple when an error occurs', async () => {
      (fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              error: 'The code provided has expired'
            }),
            { status: 401 }
          )
        );

      await expect(AuthorizationService.getAuthorizationToken(code, authTokenOptions))
        .rejects
        .toEqual({ error: 'The code provided has expired' });

      expect(fetch).toBeCalledTimes(1);
      expect(fetch).toBeCalledWith(
        'https://appleid.apple.com/auth/token',
        {
          method: 'POST',
          body: JSON.stringify({
            client_id: authTokenOptions.clientID,
            client_secret: authTokenOptions.clientSecret,
            code,
            grant_type: 'authorization_code',
            redirect_uri: authTokenOptions.redirectUri,
          }),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      )
    });
  });
});
