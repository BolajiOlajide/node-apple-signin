
# @bolajiolajide/node-apple-signin

Node.JS wrapper around [Sign in with Apple REST API](https://developer.apple.com/documentation/signinwithapplerestapi).
It provides helper functionality around apple's authentication mechanism for NodeJS.

This module lets you authenticate users using Apple account in your Node.js application.

## Prerequisites

1. You should be enrolled in [Apple Developer Program](https://developer.apple.com/programs/).
2. Please have a look at [Apple documentation](
https://developer.apple.com/sign-in-with-apple/get-started/) related to "Sign in with Apple" feature.
3. You should create App ID and Service ID in your Apple Developer Account.
4. You should generate private key for your Service ID in your Apple Developer Account.

More detail about configuration can be found in [blog post](https://medium.com/@artyomefremov/add-sign-in-with-apple-button-to-your-website-today-part-1-12ed1444623a?postPublishedType=initial) and [Apple docs](https://help.apple.com/developer-account/#/dev1c0e25352).


## Installation

Install the module using [npm](http://npmjs.com):

```sh
npm install @bolajiolajide/node-apple-signin
```

or using [yarn](https://yarnpkg.com)

```sh
yarn add @bolajiolajide/node-apple-signin
```


## Usage/Examples

### 1. Get authorization URL

Start "Sign in with Apple" flow by redirecting user to the authorization URL.

```js
const appleSignin = require("@bolajiolajide/node-apple-signin");

const options = {
    clientID: "com.gotechmakers.auth.client", // identifier of Apple Service ID.
    redirectUri: "http://localhost:3000/auth/apple/callback",
    state: "123", // optional, An unguessable random string. It is primarily used to protect against CSRF attacks.
    scope: "email" // optional, default value is "email".
};

const authorizationUrl = appleSignin.getAuthorizationUrl(options);
```

Alternatively, you can use [Sign In with Apple](https://developer.apple.com/documentation/signinwithapplejs) browser javascript library.

### 2. Get access token

2.1. Retrieve "code" query param from URL string when user is redirected to your site after successful sign in with Apple. Example:
`http://localhost:3000/auth/apple/callback?code=somecode&state=123`.

2.2. Exchange retrieved "code" to user's access token.

More detail can be found in [Apple docs](https://developer.apple.com/documentation/signinwithapplerestapi/generate_and_validate_tokens).

```js
const clientSecret = appleSignin.getClientSecret({
    clientID: "com.gotechmakers.auth.client", // identifier of Apple Service ID.
    teamId: "teamId", // Apple Developer Team ID.
    key: "-----BEGIN PRIVATE KEY----- ...", // private key associated with client ID
    keyIdentifier: "XXX" // identifier of the private key.
});

const options = {
    clientID: "com.gotechmakers.auth.client", // identifier of Apple Service ID.
    redirectUri: "http://localhost:3000/auth/apple/callback", // use the same value which you passed to authorisation URL,
    clientSecret: clientSecret
};

appleSignin.getAuthorizationToken(code, options).then(tokenResponse => {
    console.log(tokenResponse);
}).catch(error => {
    console.log(error);
});
```

Result of ```getAuthorizationToken``` command is a JSON object representing Apple's [TokenResponse](https://developer.apple.com/documentation/signinwithapplerestapi/tokenresponse):

```js
{
    access_token: "ACCESS_TOKEN", // A token used to access allowed data.
    token_type: 'Bearer', // It will always be Bearer.
    expires_in: 3600, // The amount of time, in seconds, before the access token expires.
    refresh_token: "REFRESH_TOKEN", // used to regenerate new access tokens. Store this token securely on your server.
    id_token: "ID_TOKEN" // A JSON Web Token that contains the user’s identity information.
}
```

### 3. Verify token signature and get unique user's identifier

```js
appleSignin.verifyIdToken(tokenResponse.id_token, clientID).then(result => {
    const userAppleId = result.sub;
}).catch(error => {
    // Token is not verified
    console.log(error);
});
```

### 4. Refresh access token after expiration

```js

const clientSecret = appleSignin.getClientSecret({
    clientID: "com.gotechmakers.auth.client", // identifier of Apple Service ID.
    teamId: "teamId", // Apple Developer Team ID.
    privateKeyPath: "/var/www/app/AuthKey_XXX.p8", // path to private key associated with your client ID.
    keyIdentifier: "XXX" // identifier of the private key.
});

const options = {
    clientID: "com.gotechmakers.auth.client", // identifier of Apple Service ID.
    clientSecret: clientSecret
};

appleSignin.refreshAuthorizationToken(refreshToken, options).then(result => {
    const newAccessToken = result.access_token;
}).catch(error => {
    console.log(error);
})
```
## Acknowledgements

- [Techofficer's Implementation](https://github.com/Techofficer/node-apple-signin)
## Authors

- [@BolajiOlajide](https://www.github.com/BolajiOlajide)

  
## Contributing

Contributions are always welcome!  
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
## License

[MIT](https://choosealicense.com/licenses/mit/)

  
## Running Tests

To run tests, run the following command

```sh
  npm run test
```

  