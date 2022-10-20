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
