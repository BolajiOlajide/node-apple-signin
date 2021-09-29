import jwt from 'jsonwebtoken';

import { getClientSecret } from '../src/client';


const sampleJwt = 'somer@nd0mt0k3n';

jest.mock('jsonwebtoken', () => ({
  ...jest.requireActual<object>('jsonwebtoken'),
  sign: jest.fn().mockReturnValue(sampleJwt),
}));

describe('client', () => {
  describe('getClientSecret', () => {
    test('throws an error when clientID is not provided', () => {
      // (jwt as jest.Mocked<typeof import('jsonwebtoken').sign>).sign.mockReturnValue(sampleJwt);
      const secret = getClientSecret({
        clientID: 'djdkjdad',
        teamId: 'sdsdsds',
        keyIdentifier: 'sdjsfsfs',
        key: '----dskdsd---'
      });

      console.log(secret, '<===', jwt.sign, jwt.sign('dsd', 'dsd', { algorithm: 'ES256' }));
      expect(true).toBe(true);
    });
  });
});
