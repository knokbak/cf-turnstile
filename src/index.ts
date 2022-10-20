/**
 * Copyright (c) 2022, knokbak
 * All rights reserved.
 * 
 * This file is subject to the terms and conditions of the BSD 3-Clause 
 * License. A copy of the license can be found in the LICENSE file. If 
 * a copy of the license was not distributed with this file, you can 
 * obtain one at https://github.com/knokbak/cf-turnstile. 
 */

const DEFAULT_API_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

type TurnstileOptions = {
    secret?: string;
    apiUrl?: string;
    hostname?: string | string[];
    remoteip?: string;
    action?: string | string[];
    cdata?: string | string[];
    debug?: boolean;
    throwOnFailure?: boolean;
};

type TurnstileResponse = {
    success: boolean;
    timestamp?: Date;
    hostname?: string;
    errors: string[];
    action?: string;
    cdata?: string;
};

function turnstile(secret?: string, globalOptions?: TurnstileOptions): (token: string, options?: TurnstileOptions) => Promise<TurnstileResponse> {
    if (secret && typeof secret !== 'string') {
        throw new TypeError('secret must be a string or undefined');
    }

    return async (token: string, options?: TurnstileOptions): Promise<TurnstileResponse> => {
        options = {
            secret: options?.secret ?? globalOptions?.secret ?? secret,
            apiUrl: options?.apiUrl ?? globalOptions?.apiUrl ?? DEFAULT_API_URL,
            hostname: options?.hostname ?? globalOptions?.hostname,
            remoteip: options?.remoteip ?? globalOptions?.remoteip,
            action: options?.action ?? globalOptions?.action,
            cdata: options?.cdata ?? globalOptions?.cdata,
            debug: options?.debug ?? globalOptions?.debug ?? false,
            throwOnFailure: options?.throwOnFailure ?? globalOptions?.throwOnFailure ?? false,
        };
        
        if (!options.secret || typeof options.secret !== 'string') {
            throw new Error('options.secret is required (when a secret is not provided globally) and must be a string');
        }
        if (!token || typeof token !== 'string') {
            throw new Error('token is required and must be a string');
        }
        
        const formData = new URLSearchParams();
        formData.append('secret', options.secret);
        formData.append('response', token);

        const remoteip = options?.remoteip;
        if (remoteip) {
            formData.append('remoteip', remoteip);
        }

        if (options.debug) {
            console.log('cf-turnstile: sending request to', options.apiUrl);
            console.log('cf-turnstile: using form data:', formData);
        }

        const received = await sendRequest(options?.apiUrl ?? DEFAULT_API_URL, {
            method: 'POST',
            body: formData,
        }).then(x => x.json()) as {
            success?: boolean;
            challenge_ts?: string;
            hostname?: string;
            'error-codes'?: string[];
            action?: string;
            cdata?: string;
        };

        const data: TurnstileResponse = {
            success: received.success ?? false,
            timestamp: received.challenge_ts ? new Date(received.challenge_ts) : undefined,
            hostname: received.hostname,
            errors: received['error-codes'] ?? [],
            action: received.action,
            cdata: received.cdata,
        };

        data.errors = received['error-codes'] ?? [];

        if (data.errors.length > 0) {
            if (options.throwOnFailure) {
                throw new Error(`cf-turnstile: Cloudflare returned one or more error codes: ${data.errors.join(', ')}`);
            }
            return data;
        }

        if (!data.success) {
            if (options.throwOnFailure) {
                throw new Error(`cf-turnstile: Cloudflare could not verify the token`);
            }
            return data;
        }

        const hostname = options?.hostname;
        const action = options?.action;
        const cdata = options?.cdata;

        if (hostname && (
            (typeof hostname === 'string' && data.hostname === hostname) &&
            (Array.isArray(hostname) && hostname.includes(data.hostname ?? ''))
        )) {
            data.success = false;
            data.errors.push('cfts-hostname-mismatch');
            if (options.throwOnFailure) {
                throw new Error(`cf-turnstile: hostname mismatch: expected ${hostname}, got ${data.hostname}`);
            }
        }
        
        if (action && (
            (typeof action === 'string' && data.action !== action) &&
            (Array.isArray(action) && !action.includes(data.action ?? ''))
        )) {
            data.success = false;
            data.errors.push('cfts-action-mismatch');
            if (options.throwOnFailure) {
                throw new Error(`cf-turnstile: action mismatch: expected ${action}, got ${data.action}`);
            }
        }

        if (cdata && (
            (typeof cdata === 'string' && data.cdata !== cdata) &&
            (Array.isArray(cdata) && !cdata.includes(data.cdata ?? ''))
        )) {
            data.success = false;
            data.errors.push('cfts-cdata-mismatch');
            if (options.throwOnFailure) {
                throw new Error(`cf-turnstile: cdata mismatch: expected ${cdata}, got ${data.cdata}`);
            }
        }

        return data;
    };
};

function sendRequest(url: string, options: RequestInit): Promise<any> {
    try {
        return fetch(url, options);
    } catch {
        const fetch = require('node-fetch');
        return fetch(url, options);
    }
};

module.exports = turnstile;
export default turnstile;
export { TurnstileOptions, TurnstileResponse };
