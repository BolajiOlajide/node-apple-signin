import { mocked } from 'ts-jest/utils';
import fetch from 'node-fetch';

import { getApplePublicKey } from '../src/token';
import { ENDPOINT_URL } from '../src/constants';


const { Response } = jest.requireActual('node-fetch');
jest.mock('node-fetch');

describe('token', () => {
  describe('getApplePublicKey', () => {
    const url = new URL(ENDPOINT_URL);
    url.pathname = '/auth/keys';

    test('', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(new Response(JSON.stringify('expectedResponse')));

      const publicKey = await getApplePublicKey();
      console.log(publicKey, '<===');

      expect(true).toBe(true);
    });
  });
});
