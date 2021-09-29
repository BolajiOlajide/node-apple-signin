import jwt from 'jsonwebtoken';

import { getClientSecret } from '../src/client';


const sampleJwt = 'somer@nd0mt0k3n';

jest.mock('jsonwebtoken');

describe('client', () => {
  describe('getClientSecret', () => {
    const key = '----dskdsd---';

    test('rerturns the JWT token if all argumenrs are fine', () => {
      const sign = jwt.sign as jest.MockedFunction<
        (
          payload: string | Buffer | object,
          secretOrPrivateKey: jwt.Secret,
          options?: jwt.SignOptions,
        ) => string
      >;
      sign.mockReturnValueOnce(sampleJwt);

      const secret = getClientSecret({
        clientID: 'djdkjdad',
        teamId: 'sdsdsds',
        keyIdentifier: 'sdjsfsfs',
        key
      });

      expect(secret).toBe(sampleJwt);
      expect(jwt.sign).toHaveBeenCalledTimes(1);
    });

    test('throws an error if clientID is falsy', () => {
      expect(() => getClientSecret({
        clientID: '',
        teamId: 'sdsdsds',
        keyIdentifier: 'sdjsfsfs',
        key: '----dskdsd---'
      })).toThrowError('clientID is empty');

      expect(jwt.sign).not.toHaveBeenCalled();
    });

    test('throws an error if teamId is falsy', () => {
      expect(() => getClientSecret({
        clientID: 'clientID',
        teamId: '',
        keyIdentifier: 'sdjsfsfs',
        key: '----dskdsd---'
      })).toThrowError('teamId is empty');

      expect(jwt.sign).not.toHaveBeenCalled();
    });

    test('throws an error if keyIdentifier is falsy', () => {
      expect(() => getClientSecret({
        clientID: 'clientID',
        teamId: 'teamId',
        keyIdentifier: '',
        key: '----dskdsd---'
      })).toThrowError('keyIdentifier is empty');

      expect(jwt.sign).not.toHaveBeenCalled();
    });

    test('throws an error if key is falsy', () => {
      expect(() => getClientSecret({
        clientID: 'clientID',
        teamId: 'teamId',
        keyIdentifier: 'keyIdentifier',
        key: ''
      })).toThrowError('key is empty');

      expect(jwt.sign).not.toHaveBeenCalled();
    });
  });
});
