# cf-turnstile
A very simple wrapper for Cloudflare Turnstile written in TypeScript.

## Quickstart
```ts
import Turnstile from 'cf-turnstile';
const turnstile = Turnstile('SECRET_KEY');

// ...

const result = await turnstile('TOKEN_PROVIDED_BY_BROWSER');
if (!result.success) {
    // The token is invalid. Reject the request.
    return;
}

// The token is valid. Continue your application logic.
```

## Initialization
You must initialize cf-turnstile. When doing so, you may provide default parameters to be used for all requests. Both the `secret` and `options` parameters are optional. If the `secret` is not provided, you must provide it every time when calling `turnstile()` (see below).

### Example
```ts
import Turnstile from 'cf-turnstile';
const turnstile = Turnstile('YOUR_SECRET_KEY', {
    // The default parameters to be used for all requests.
    // See the "Parameters" section below (for `turnstile()`) for a list.
});
```

## API Reference

### turnstile(token: string, options?: TurnstileOptions): Promise\<TurnstileResult\>
Verifies a token provided by the browser. Returns a promise that resolves to a `TurnstileResult` object.

#### Parameters

##### token: string
The token provided by the browser.

##### options: TurnstileOptions
An optional object containing options for the request.
- `secret`? (`string`): The secret key used to generate the token. If not provided, the secret key provided to the `Turnstile` function will be used. Overrides the default secret key that was provided to the `Turnstile` function.
- `apiUrl`? (`string`): The URL of the Cloudflare Turnstile API. Defaults to `https://challenges.cloudflare.com/turnstile/v0/siteverify`.
- `hostname`? (`string` | `string[]`): The hostname(s) to expect. The validation will fail if this is provided and does not match the value returned by Cloudflare.
- `remoteip`? (`string`): The remote user's IP address. This will be sent to Cloudflare.
- `action`? (`string` | `string[]`): The action(s) to expect. The validation will fail if this is provided and does not match the value returned by Cloudflare.
- `cdata`? (`string` | `string[]`): The challenge data(s) (`cData`) to expect. The validation will fail if this is provided and does not match the value returned by Cloudflare.
- `debug`? (`string`): Enables debug mode. Logs to console what data is sent to and received from Cloudflare.
- `throwOnFailure`? (`boolean`): If set to `true`, the promise will be rejected if the validation fails. Defaults to `false`.

#### Returns
A promise that resolves to a `TurnstileResult` object.

> **Note:** If `throwOnFailure` is set to `true`, the promise will be rejected instead of resolving.

##### TurnstileResult
An object containing the result of the validation.
- `success` (`boolean`): `true` if the validation was successful, `false` otherwise.
- `timestamp`? (`Date`): The timestamp of the challenge.
- `hostname`? (`string`): The hostname of the site the challenge was ran on.
- `errors` (`string[]`): Any error codes returned by Cloudflare or added by cf-turnstile. Empty if the validation was successful.
- `action`? (`string`): The action the challenge was ran for.
- `cdata`? (`string`): The challenge data (`cData`) returned by Cloudflare.

## License

This software is not owned or maintained by Cloudflare.

```
Copyright (c) 2022, knokbak
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```
