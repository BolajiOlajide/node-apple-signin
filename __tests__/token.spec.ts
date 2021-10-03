import fetch from 'node-fetch';

import * as TokenService from '../src/token';
import { ENDPOINT_URL } from '../src/constants';
import { mockPublicKeyResponse } from '../src/fixtures/key.fixture';


const { Response } = jest.requireActual('node-fetch');
jest.mock('node-fetch');

describe('token', () => {
  const expectedPublicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4dGQ7bQK8LgILOdLsYzf
ZjkEAoQeVC/aqyc8GC6RX7dq/KvRAQAWPvkam8VQv4GK5T4ogklEKEvj5ISBamdD
Nq1n52TpxQwI2EqxSk7I9fKPKhRt4F8+2yETlYvye+2s6NeWJim0KBtOVrk0gWvE
Dgd6WOqJl/yt5WBISvILNyVg1qAAM8JeX6dRPosahRVDjA52G2X+Tip84wqwyRpU
lq2ybzcLh3zyhCitBOebiRWDQfG26EH9lTlJhll+p/Dg8vAXxJLIJ4SNLcqgFeZe
4OfHLgdzMvxXZJnPp/VgmkcpUdRotazKZumj6dBPcXI/XID4Z4Z3OM1KrZPJNdUh
xwIDAQAB
-----END PUBLIC KEY-----`;

  describe('getApplePublicKey', () => {
    const url = new URL(ENDPOINT_URL);
    url.pathname = '/auth/keys';

    test('returns the generated private key if request is successful', async () => {
      expect.assertions(1);
      (fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify(mockPublicKeyResponse)
          )
        );

      const publicKey = await TokenService.getApplePublicKey();

      expect(publicKey).toEqual(expectedPublicKey);
    });

    test('throws an error if the API call wasn\'t successful', async () => {
      expect.assertions(1);
      (fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify(mockPublicKeyResponse),
            { status: 400 }
          )
        );

      await expect(TokenService.getApplePublicKey())
        .rejects
        .toEqual({ message: 'Response to get public key was unsuccessful' });
      // const res = await ;
      // expect(async () => await getApplePublicKey())
      //   .toThrowError('Response to get public key was unsuccessful');
    });
  });

  describe('verifyIdToken', () => {
    beforeEach(() => {
      jest.spyOn(TokenService, 'getApplePublicKey')
        .mockImplementationOnce(async () => expectedPublicKey);
    });

    test('', () => {
      expect(true).toBe(true);
    })
  });
});
