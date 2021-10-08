import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';

import * as TokenService from '../src/token';
import { ENDPOINT_URL, TOKEN_ISSUER } from '../src/constants';
import { mockPublicKeyResponse } from './fixtures/key.fixture';


const { Response } = jest.requireActual('node-fetch');

const mockedImportKey = jest.fn().mockName('mocked import key');
const mockedExportKey = jest.fn().mockName('mocked export key');

jest.mock('node-rsa', () => {
  return function() {
    return {
      importKey: mockedImportKey,
      exportKey: mockedExportKey
    };
  }
});

describe('token', () => {
  const expectedPublicKey = 'expectedPublicKey';

  describe('getApplePublicKey', () => {
    const url = new URL(ENDPOINT_URL);
    url.pathname = '/auth/keys';

    test('returns the generated private key if request is successful', async () => {
      expect.assertions(2);
      (fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify(mockPublicKeyResponse)
          )
        );

      const publicKey = await TokenService.getApplePublicKey();

      expect(publicKey).toEqual(expectedPublicKey);
      expect(fetch).toBeCalledTimes(1);
    });

    test('returns a rejected promise if the API call wasn\'t successful', async () => {
      expect.assertions(2);
      (fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify(mockPublicKeyResponse),
            { status: 400 }
          )
        );

      await expect(TokenService.getApplePublicKey())
        .rejects
        .toEqual({ message: 'unable to fetch apple\'s public keys' });
      expect(fetch).toBeCalledTimes(1);
    });
  });

  describe('verifyIdToken', () => {
    beforeEach(() => {
      jest.spyOn(TokenService, 'getApplePublicKey')
        .mockImplementationOnce(async () => expectedPublicKey);
    });

    const idToken = 'randomIdToken';
    const clientID = 'randomClientID';
    const sampleVerificationData = {
      iss: TOKEN_ISSUER,
      aud: clientID,
      exp: (Date.now() + 36000) / 100,
    };

    test('returns a rejected promise if the issuer isnt valid', async () => {
      expect.assertions(2);
      const verify = jwt.verify as jest.MockedFunction<
        (
          token: string,
          secretOrPrivateKey: jwt.Secret,
          options?: jwt.VerifyOptions
        ) => jwt.JwtPayload | string
      >;
      verify.mockReturnValueOnce({
        ...sampleVerificationData,
        iss: 'random issuer'
      });

      await expect(TokenService.verifyIdToken(idToken, clientID))
        .rejects
        .toEqual({ message: 'JWT issuer is invalid. Please provide JWT issued by Apple' });
      expect(jwt.verify).toBeCalledTimes(1);
    });

    test('returns a rejected promise if the clientID doesn\'t match audience property', async () => {
      expect.assertions(2);
      const verify = jwt.verify as jest.MockedFunction<
        (
          token: string,
          secretOrPrivateKey: jwt.Secret,
          options?: jwt.VerifyOptions
        ) => jwt.JwtPayload | string
      >;
      verify.mockReturnValueOnce({
        ...sampleVerificationData,
        aud: 'random audience'
      });

      await expect(TokenService.verifyIdToken(idToken, clientID))
        .rejects
        .toEqual({ message: 'JWT audience is invalid for this client' });
      expect(jwt.verify).toBeCalledTimes(1);
    });

    test('returns a rejected promise if the jwt verification response has expired', async () => {
      expect.assertions(2);
      const verify = jwt.verify as jest.MockedFunction<
        (
          token: string,
          secretOrPrivateKey: jwt.Secret,
          options?: jwt.VerifyOptions
        ) => jwt.JwtPayload | string
      >;
      verify.mockReturnValueOnce({
        ...sampleVerificationData,
        exp: 1333102
      });

      await expect(TokenService.verifyIdToken(idToken, clientID))
        .rejects
        .toEqual({ message: 'JWT token provided has expired' });
      expect(jwt.verify).toBeCalledTimes(1);
    });

    test('returns jwtClaims if all fields are vlaid', async () => {
      expect.assertions(2);
      const verify = jwt.verify as jest.MockedFunction<
        (
          token: string,
          secretOrPrivateKey: jwt.Secret,
          options?: jwt.VerifyOptions
        ) => jwt.JwtPayload | string
      >;
      verify.mockReturnValueOnce(sampleVerificationData);

      const verificationResponse = await TokenService.verifyIdToken(idToken, clientID);

      expect(verificationResponse).toEqual(sampleVerificationData)
      expect(jwt.verify).toBeCalledTimes(1);
    });
  });

  describe('refreshAuthorizationToken', () => {
    const refreshToken = 'randomRefreshToken';
    const refreshTokenOpts = {
      clientID: 'randomClientID',
      clientSecret: 'randomClientSecret'
    };
    const newToken = 'new_token_for_user';

    test('returns promise rejection if clientID is falsy', async () => {
      expect.assertions(2);
      (fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({})
          )
        );

      await expect(TokenService.refreshAuthorizationToken(refreshToken, {
        ...refreshTokenOpts,
        clientID: ''
      }))
        .rejects
        .toEqual({ message: 'clientID must be provided for refresh token authorization'});
      expect(fetch).not.toBeCalled();
    });

    test('returns promise rejection if clientSecret is falsy', async () => {
      expect.assertions(2);
      (fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({})
          )
        );

      await expect(TokenService.refreshAuthorizationToken(refreshToken, {
        ...refreshTokenOpts,
        clientSecret: ''
      }))
        .rejects
        .toEqual({ message: 'clientSecret must be provided for refresh token authorization'});
      expect(fetch).not.toBeCalled();
    });

    test('returns refresh token response if API call is successful', async () => {
      expect.assertions(3);
      (fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              token: newToken
            })
          )
        );
      const url = new URL(ENDPOINT_URL);
      url.pathname = '/auth/token';

      const refreshTokenResponse = await TokenService.refreshAuthorizationToken(refreshToken, refreshTokenOpts)

      expect(refreshTokenResponse).toEqual({ token: newToken });
      expect(fetch).toBeCalledTimes(1);
      expect(fetch).toBeCalledWith(
        url.toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' } ,
          method: 'POST',
          body: JSON.stringify({
            client_id: refreshTokenOpts.clientID,
            client_secret: refreshTokenOpts.clientSecret,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
          })
        },
      )
    });

    test('returns error message if API call is unsuccessful', async () => {
      expect.assertions(3);

      const errorObject = {
        status: 'error',
        meessage: 'dsdsdsd'
      };

      (fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify(errorObject),
            { status: 400 },
          ),
        );
      const url = new URL(ENDPOINT_URL);
      url.pathname = '/auth/token';

      await expect(TokenService.refreshAuthorizationToken(refreshToken, refreshTokenOpts))
        .rejects
        .toEqual(errorObject);
      expect(fetch).toBeCalledTimes(1);
      expect(fetch).toBeCalledWith(
        url.toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' } ,
          method: 'POST',
          body: JSON.stringify({
            client_id: refreshTokenOpts.clientID,
            client_secret: refreshTokenOpts.clientSecret,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
          })
        },
      )
    });
  });
});
