# cf-turnstile
A very simple wrapper for Cloudflare Turnstile written in TypeScript.

## Quickstart
```ts
import Turnstile from 'cf-turnstile';
const turnstile = Turnstile('SECRET_KEY');
// ...
turnstile('TOKEN_PROVIDED_BY_BROWSER').then((result) => {
    if (result.success) {
        // The token is valid. Complete your request.
    } else {
        // The token is invalid, too old, or fake.
    }
})
```
