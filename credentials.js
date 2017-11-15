//==============================================================================
// Exports the AzureClientCredentials class that provides the getAccessToken()
// method. The mechanism by which the access token is obtained is described by
// the "Service to Service Calls Using Client Credentials" article, available
// at https://tinyurl.com/service-to-service-calls.
//==============================================================================
// Copyright 2017 Buchanan & Edwards
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//==============================================================================
// Author: Frank Hellwig <frank.hellwig@buchanan-edwards.com>
//==============================================================================

'use strict';

//------------------------------------------------------------------------------
// Dependencies
//------------------------------------------------------------------------------

const request = require('request');

//------------------------------------------------------------------------------
// Initialization
//------------------------------------------------------------------------------

const FIVE_MINUTE_BUFFER = 5 * 60 * 1000;
const MICROSOFT_LOGIN_URL = 'https://login.microsoftonline.com';

//------------------------------------------------------------------------------
// Public
//------------------------------------------------------------------------------

/**
 * The AzureClientCredentals class is instantiated using the constructor with
 * three arguments. After instantiation, the getAccessToken() method returns
 * an access token for the specified resource.
 */
class AzureClientCredentials {
  /**
   * Creates a new AzureClientCredentials class.
   * @param {string} tenant - The Azure AD tenant.
   * @param {string} clientId - The client App ID URI.
   * @param {string} clientSecret - The client secret from Azure AD.
   */
  constructor(tenant, clientId, clientSecret) {
    this.tenant = tenant;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.tokens = {};
  }

  /**
   * Gets the access token from the login service or returns a cached
   * access token if the token expiration time has not been exceeded. 
   * @param {string} resource - The App ID URI for which access is requested.
   * @returns A promise that is resolved with the access token.
   */
  getAccessToken(resource) {
    let token = this.tokens[resource];
    if (token) {
      var now = new Date();
      if (now.getTime() < token.exp) {
        return Promise.resolve(token.val);
      }
    }
    return this._requestAccessToken(resource);
  }

  /**
   * Requests the access token using the OAuth 2.0 client credentials flow.
   * @param {string} resource - The App ID URI for which access is requested.
   * @returns A promise that is resolved with the access token.
   */
  _requestAccessToken(resource) {
    let params = {
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      resource: resource
    };
    return this._httpsPost('token', params).then(body => {
      let now = new Date();
      let exp = now.getTime() + parseInt(body.expires_in) * 1000;
      this.tokens[resource] = {
        val: body.access_token,
        exp: exp - FIVE_MINUTE_BUFFER
      };
      return body.access_token;
    });
  }

  /**
   * Sends an HTTPS POST request to the specified endpoint.
   * The endpoint is the last part of the URI (e.g., "token").
   * @param {string} endpoint - The last part of the URI.
   * @param {object} params - The form parameters to send.
   * @returns A promise that is resolved with the response body.
   */
  _httpsPost(endpoint, params) {
    const options = {
      method: 'POST',
      baseUrl: MICROSOFT_LOGIN_URL,
      uri: `/${this.tenant}/oauth2/${endpoint}`,
      form: params,
      json: true,
      encoding: 'utf8'
    };
    return new Promise((resolve, reject) => {
      request(options, (err, response, body) => {
        if (err) return reject(err);
        if (body.error) {
          err = new Error(body.error_description.split(/\r?\n/)[0]);
          err.code = body.error;
          return reject(err);
        }
        resolve(body);
      });
    });
  }
}

//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------

module.exports = AzureClientCredentials;
