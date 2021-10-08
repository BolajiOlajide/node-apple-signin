import * as AuthorizationService from '../src/authorization';

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
});
