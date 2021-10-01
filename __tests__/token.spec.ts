import { mocked } from 'ts-jest/utils';
import fetch from 'node-fetch';

import { getApplePublicKey } from '../src/token';
import { ENDPOINT_URL } from '../src/constants';
import { mockPublicKeyResponse } from '../src/fixtures/key.fixture';


const { Response } = jest.requireActual('node-fetch');
jest.mock('node-fetch');

describe('token', () => {
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

      const expectedKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4dGQ7bQK8LgILOdLsYzf
ZjkEAoQeVC/aqyc8GC6RX7dq/KvRAQAWPvkam8VQv4GK5T4ogklEKEvj5ISBamdD
Nq1n52TpxQwI2EqxSk7I9fKPKhRt4F8+2yETlYvye+2s6NeWJim0KBtOVrk0gWvE
Dgd6WOqJl/yt5WBISvILNyVg1qAAM8JeX6dRPosahRVDjA52G2X+Tip84wqwyRpU
lq2ybzcLh3zyhCitBOebiRWDQfG26EH9lTlJhll+p/Dg8vAXxJLIJ4SNLcqgFeZe
4OfHLgdzMvxXZJnPp/VgmkcpUdRotazKZumj6dBPcXI/XID4Z4Z3OM1KrZPJNdUh
xwIDAQAB
-----END PUBLIC KEY-----`;

      const publicKey = await getApplePublicKey();

      expect(publicKey).toEqual(expectedKey);
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

      await expect(getApplePublicKey())
        .rejects
        .toEqual({ message: 'Response to get public key was unsuccessful' });
      // const res = await ;
      // expect(async () => await getApplePublicKey())
      //   .toThrowError('Response to get public key was unsuccessful');
    });
  });
});
