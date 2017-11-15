# azure-client-credentials

Requests and caches access tokens for Azure Active Directory (AAD) resources using client credentials.

Version 1.0.1

Exports the `AzureClientCredentials` class that provides the `getAccessToken()` method. The mechanism by which the access token is obtained is described by the [Service to Service Calls Using Client Credentials](https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-protocols-oauth-service-to-service) article.

## Installation

```bash
$ npm install --save azure-client-credentials
```

## Usage

```javascript
const AzureClientCredentials = require('azure-client-credentials');

const TENANT = 'my-company.com';
const CLIENT_ID = '36486060-d567-4ea6-91e6-8cd431edb722';
const CLIENT_SECRET = 'VGhpcyBpcyBteSBBenVyZSBBRCBjbGllbnQgc2VjcmV0Lg==';
const RESOURCE = 'https://my-company.com/my-resource';

const credentials = new AzureClientCredentials(TENANT, CLIENT_ID, CLIENT_SECRET);

credentials.getAccessToken(RESOURCE).then(token => {
  console.log(token);
}).catch(err => {
  console.error(err);
});
```

You can request access tokens for any number of resources. The tokens are cached and refreshed automatically.

## API

### Constructor

```javascript
AzureClientCredentials(tenant, clientId, clientSecret)
```

Creates a new `AzureClientCredentials` instance for the specified `tenant`. The `clientId` and the `clientSecret` must be for an AAD application that has access rights to the resource specified as the parameter to the `getAccessToken()` method.

### getAccessToken()

```javascript
getAccessToken(resource)
```

Gets the access token for the specified resource. If no token exists in the token cache, it is requested from the Microsoft login service at `login.microsoftonline.com`. This method returns a promise that is resolved with the access token.

## License

Copyright 2017 Buchanan & Edwards

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.